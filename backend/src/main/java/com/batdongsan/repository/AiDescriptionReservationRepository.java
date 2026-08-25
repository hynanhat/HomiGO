package com.batdongsan.repository;

import com.batdongsan.entity.AiDescriptionReservation;
import com.batdongsan.entity.AiDescriptionReservationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AiDescriptionReservationRepository extends JpaRepository<AiDescriptionReservation, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select reservation from AiDescriptionReservation reservation
             where reservation.usage.id = :usageId
               and reservation.status = :status
               and reservation.leaseExpiresAt <= :now
            """)
    List<AiDescriptionReservation> findExpiredForUpdate(
            @Param("usageId") Long usageId,
            @Param("status") AiDescriptionReservationStatus status,
            @Param("now") LocalDateTime now);

    @Query("select reservation.usage.id from AiDescriptionReservation reservation where reservation.reservationToken = :token")
    Optional<Long> findUsageIdByToken(@Param("token") String token);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select reservation from AiDescriptionReservation reservation where reservation.reservationToken = :token")
    Optional<AiDescriptionReservation> findByTokenForUpdate(@Param("token") String token);

    @Query("""
            select reservation.reservationToken from AiDescriptionReservation reservation
             where reservation.status = :status and reservation.leaseExpiresAt <= :now
             order by reservation.leaseExpiresAt asc
            """)
    List<String> findExpiredTokens(@Param("status") AiDescriptionReservationStatus status,
                                   @Param("now") LocalDateTime now,
                                   Pageable pageable);

    @Query("""
            select min(reservation.leaseExpiresAt) from AiDescriptionReservation reservation
             where reservation.usage.id = :usageId and reservation.status = :status
            """)
    Optional<LocalDateTime> findEarliestLease(@Param("usageId") Long usageId,
                                              @Param("status") AiDescriptionReservationStatus status);
}
