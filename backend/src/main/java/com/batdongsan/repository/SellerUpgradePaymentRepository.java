package com.batdongsan.repository;

import com.batdongsan.entity.PaymentStatus;
import com.batdongsan.entity.SellerUpgradePayment;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SellerUpgradePaymentRepository extends JpaRepository<SellerUpgradePayment, Long> {
    Optional<SellerUpgradePayment> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, PaymentStatus status);

    Optional<SellerUpgradePayment> findByOrderCodeAndUserId(String orderCode, Long userId);

    Page<SellerUpgradePayment> findByUserId(Long userId, Pageable pageable);

    boolean existsByProviderTransactionIdAndIdNot(String providerTransactionId, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select payment
              from SellerUpgradePayment payment
              join fetch payment.user
             where payment.orderCode = :orderCode
               and payment.user.id = :userId
            """)
    Optional<SellerUpgradePayment> findOwnedForUpdate(
            @Param("orderCode") String orderCode,
            @Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select payment
              from SellerUpgradePayment payment
              join fetch payment.user
             where payment.orderCode = :orderCode
            """)
    Optional<SellerUpgradePayment> findByOrderCodeForUpdate(@Param("orderCode") String orderCode);
}
