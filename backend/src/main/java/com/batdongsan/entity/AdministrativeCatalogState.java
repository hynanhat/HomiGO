package com.batdongsan.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "administrative_catalog_state")
public class AdministrativeCatalogState {
    @Id
    @Column(name = "singleton_key", nullable = false)
    private Byte singletonKey = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_release_id")
    private AdministrativeDatasetRelease activeRelease;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Version
    private Long version;

    public AdministrativeCatalogState() {}

    public Byte getSingletonKey() { return singletonKey; }
    public void setSingletonKey(Byte singletonKey) { this.singletonKey = singletonKey; }
    public AdministrativeDatasetRelease getActiveRelease() { return activeRelease; }
    public void setActiveRelease(AdministrativeDatasetRelease activeRelease) { this.activeRelease = activeRelease; }
    public User getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(User updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
