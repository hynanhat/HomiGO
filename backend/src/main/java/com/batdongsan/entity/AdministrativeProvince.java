package com.batdongsan.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "administrative_provinces")
public class AdministrativeProvince {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dataset_release_id", nullable = false)
    private AdministrativeDatasetRelease datasetRelease;

    @Column(name = "official_code", nullable = false, length = 10)
    private String officialCode;

    @Column(name = "official_name", nullable = false)
    private String officialName;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false, length = 32)
    private AdministrativeProvinceType unitType;

    @Enumerated(EnumType.STRING)
    @Column(name = "catalog_status", nullable = false, length = 32)
    private AdministrativeCatalogStatus catalogStatus = AdministrativeCatalogStatus.ACTIVE;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public AdministrativeProvince() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AdministrativeDatasetRelease getDatasetRelease() { return datasetRelease; }
    public void setDatasetRelease(AdministrativeDatasetRelease datasetRelease) { this.datasetRelease = datasetRelease; }
    public String getOfficialCode() { return officialCode; }
    public void setOfficialCode(String officialCode) { this.officialCode = officialCode; }
    public String getOfficialName() { return officialName; }
    public void setOfficialName(String officialName) { this.officialName = officialName; }
    public AdministrativeProvinceType getUnitType() { return unitType; }
    public void setUnitType(AdministrativeProvinceType unitType) { this.unitType = unitType; }
    public AdministrativeCatalogStatus getCatalogStatus() { return catalogStatus; }
    public void setCatalogStatus(AdministrativeCatalogStatus catalogStatus) { this.catalogStatus = catalogStatus; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
