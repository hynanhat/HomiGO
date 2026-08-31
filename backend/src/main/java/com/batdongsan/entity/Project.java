package com.batdongsan.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false)
    private String investor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "administrative_province_id", nullable = false)
    private AdministrativeProvince administrativeProvince;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commune_unit_id", nullable = false)
    private CommuneUnit communeUnit;

    @Column(nullable = false, length = 500)
    private String address;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_from")
    private BigDecimal priceFrom;

    @Column(name = "price_to")
    private BigDecimal priceTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Project() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getInvestor() { return investor; }
    public void setInvestor(String investor) { this.investor = investor; }
    public AdministrativeProvince getAdministrativeProvince() { return administrativeProvince; }
    public void setAdministrativeProvince(AdministrativeProvince administrativeProvince) { this.administrativeProvince = administrativeProvince; }
    public CommuneUnit getCommuneUnit() { return communeUnit; }
    public void setCommuneUnit(CommuneUnit communeUnit) { this.communeUnit = communeUnit; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPriceFrom() { return priceFrom; }
    public void setPriceFrom(BigDecimal priceFrom) { this.priceFrom = priceFrom; }
    public BigDecimal getPriceTo() { return priceTo; }
    public void setPriceTo(BigDecimal priceTo) { this.priceTo = priceTo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
