package com.batdongsan.repository;

import com.batdongsan.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from RefreshToken token join fetch token.user where token.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from RefreshToken token where token.expiresAt < :now or "
            + "(token.revokedAt is not null and token.revokedAt < :revokedBefore)")
    int deleteExpiredOrRevokedBefore(@Param("now") LocalDateTime now,
                                     @Param("revokedBefore") LocalDateTime revokedBefore);

    List<RefreshToken> findAllByUserIdAndRevokedAtIsNull(Long userId);
}
