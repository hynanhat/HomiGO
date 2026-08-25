package com.batdongsan.repository;

import com.batdongsan.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @EntityGraph(attributePaths = {"listing"})
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"listing"})
    Page<Notification> findByUserIdAndReadAtIsNull(Long userId, Pageable pageable);

    long countByUserIdAndReadAtIsNull(Long userId);

    @EntityGraph(attributePaths = {"listing"})
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Notification notification
               set notification.readAt = :readAt
             where notification.user.id = :userId
               and notification.readAt is null
            """)
    int markAllRead(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);
}
