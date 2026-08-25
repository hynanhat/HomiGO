package com.batdongsan.repository;

import com.batdongsan.entity.AiDailyUsage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface AiDailyUsageRepository extends JpaRepository<AiDailyUsage, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select usage from AiDailyUsage usage
             where usage.user.id = :userId and usage.businessDate = :businessDate
            """)
    Optional<AiDailyUsage> findForUpdate(@Param("userId") Long userId,
                                         @Param("businessDate") LocalDate businessDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select usage from AiDailyUsage usage where usage.id = :id")
    Optional<AiDailyUsage> findByIdForUpdate(@Param("id") Long id);
}
