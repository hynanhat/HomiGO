package com.batdongsan.repository;

import com.batdongsan.entity.AdministrativeCatalogState;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdministrativeCatalogStateRepository extends JpaRepository<AdministrativeCatalogState, Byte> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select state from AdministrativeCatalogState state where state.singletonKey = :key")
    Optional<AdministrativeCatalogState> findLockedBySingletonKey(@Param("key") Byte key);
}
