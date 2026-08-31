package com.batdongsan.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "administrative_dataset_releases")
public class AdministrativeDatasetRelease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dataset_version", nullable = false, unique = true, length = 100)
    private String datasetVersion;

    @Column(nullable = false)
    private String authority;

    @Column(name = "document_number", nullable = false, length = 100)
    private String documentNumber;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "source_urls_json", nullable = false, columnDefinition = "json")
    private String sourceUrlsJson;

    @Column(nullable = false, length = 500)
    private String attribution;

    @Column(name = "raw_sha256", nullable = false, length = 64)
    private String rawSha256;

    @Column(name = "normalized_sha256", nullable = false, length = 64)
    private String normalizedSha256;

    @Column(name = "transform_version", nullable = false, length = 100)
    private String transformVersion;

    @Column(name = "expected_province_count", nullable = false)
    private Integer expectedProvinceCount;

    @Column(name = "expected_commune_count", nullable = false)
    private Integer expectedCommuneCount;

    @Column(name = "actual_province_count")
    private Integer actualProvinceCount;

    @Column(name = "actual_commune_count")
    private Integer actualCommuneCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AdministrativeDatasetStatus status = AdministrativeDatasetStatus.STAGED;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_summary_json", columnDefinition = "json")
    private String validationSummaryJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private User validatedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activated_by")
    private User activatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Version
    private Long version;

    public AdministrativeDatasetRelease() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDatasetVersion() { return datasetVersion; }
    public void setDatasetVersion(String datasetVersion) { this.datasetVersion = datasetVersion; }
    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public LocalDate getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(LocalDate effectiveDate) { this.effectiveDate = effectiveDate; }
    public LocalDateTime getRetrievedAt() { return retrievedAt; }
    public void setRetrievedAt(LocalDateTime retrievedAt) { this.retrievedAt = retrievedAt; }
    public String getSourceUrlsJson() { return sourceUrlsJson; }
    public void setSourceUrlsJson(String sourceUrlsJson) { this.sourceUrlsJson = sourceUrlsJson; }
    public String getAttribution() { return attribution; }
    public void setAttribution(String attribution) { this.attribution = attribution; }
    public String getRawSha256() { return rawSha256; }
    public void setRawSha256(String rawSha256) { this.rawSha256 = rawSha256; }
    public String getNormalizedSha256() { return normalizedSha256; }
    public void setNormalizedSha256(String normalizedSha256) { this.normalizedSha256 = normalizedSha256; }
    public String getTransformVersion() { return transformVersion; }
    public void setTransformVersion(String transformVersion) { this.transformVersion = transformVersion; }
    public Integer getExpectedProvinceCount() { return expectedProvinceCount; }
    public void setExpectedProvinceCount(Integer expectedProvinceCount) { this.expectedProvinceCount = expectedProvinceCount; }
    public Integer getExpectedCommuneCount() { return expectedCommuneCount; }
    public void setExpectedCommuneCount(Integer expectedCommuneCount) { this.expectedCommuneCount = expectedCommuneCount; }
    public Integer getActualProvinceCount() { return actualProvinceCount; }
    public void setActualProvinceCount(Integer actualProvinceCount) { this.actualProvinceCount = actualProvinceCount; }
    public Integer getActualCommuneCount() { return actualCommuneCount; }
    public void setActualCommuneCount(Integer actualCommuneCount) { this.actualCommuneCount = actualCommuneCount; }
    public AdministrativeDatasetStatus getStatus() { return status; }
    public void setStatus(AdministrativeDatasetStatus status) { this.status = status; }
    public String getValidationSummaryJson() { return validationSummaryJson; }
    public void setValidationSummaryJson(String validationSummaryJson) { this.validationSummaryJson = validationSummaryJson; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public User getValidatedBy() { return validatedBy; }
    public void setValidatedBy(User validatedBy) { this.validatedBy = validatedBy; }
    public User getActivatedBy() { return activatedBy; }
    public void setActivatedBy(User activatedBy) { this.activatedBy = activatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(LocalDateTime validatedAt) { this.validatedAt = validatedAt; }
    public LocalDateTime getActivatedAt() { return activatedAt; }
    public void setActivatedAt(LocalDateTime activatedAt) { this.activatedAt = activatedAt; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
