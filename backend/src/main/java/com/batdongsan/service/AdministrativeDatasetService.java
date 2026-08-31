package com.batdongsan.service;

import com.batdongsan.dto.admin.location.AdministrativeDatasetRes;
import com.batdongsan.entity.*;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.batdongsan.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdministrativeDatasetService {
    private final AdministrativeDatasetValidator validator;
    private final AdministrativeDatasetReleaseRepository releases;
    private final AdministrativeCatalogStateRepository catalogStates;
    private final AdministrativeProvinceRepository provinces;
    private final CommuneUnitRepository communes;
    private final UserRepository users;
    private final ObjectMapper objectMapper;

    public AdministrativeDatasetService(
            AdministrativeDatasetValidator validator,
            AdministrativeDatasetReleaseRepository releases,
            AdministrativeCatalogStateRepository catalogStates,
            AdministrativeProvinceRepository provinces,
            CommuneUnitRepository communes,
            UserRepository users,
            ObjectMapper objectMapper) {
        this.validator = validator;
        this.releases = releases;
        this.catalogStates = catalogStates;
        this.provinces = provinces;
        this.communes = communes;
        this.users = users;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Page<AdministrativeDatasetRes> list(Pageable pageable) {
        return releases.findAll(pageable).map(AdministrativeDatasetRes::from);
    }

    @Transactional
    public AdministrativeDatasetRes validateBundled(String datasetVersion, String actorEmail) {
        var artifact = validator.validateBundled(datasetVersion);
        var manifest = artifact.manifest();
        User actor = actor(actorEmail);
        AdministrativeDatasetRelease release = releases.findByDatasetVersion(datasetVersion).orElse(null);
        if (release != null && !release.getNormalizedSha256().equals(manifest.normalizedSha256())) {
            throw new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_CHECKSUM_CONFLICT);
        }
        if (release == null) {
            release = new AdministrativeDatasetRelease();
            release.setDatasetVersion(manifest.datasetVersion());
            release.setCreatedBy(actor);
        }
        applyManifest(release, artifact);
        if (release.getStatus() != AdministrativeDatasetStatus.ACTIVE) {
            release.setStatus(AdministrativeDatasetStatus.VALIDATED);
        }
        release.setValidatedBy(actor);
        release.setValidatedAt(LocalDateTime.now());
        release.setValidationSummaryJson(json(Map.of(
                "valid", true,
                "provinceCount", artifact.provinces().size(),
                "communeCount", artifact.communeUnits().size(),
                "message", "Artifact chính thức đã vượt qua toàn bộ kiểm tra.")));
        return AdministrativeDatasetRes.from(releases.save(release));
    }

    @Transactional
    public AdministrativeDatasetRes activate(String datasetVersion, String actorEmail) {
        var artifact = validator.validateBundled(datasetVersion);
        User actor = actor(actorEmail);
        AdministrativeDatasetRelease release = releases.findByDatasetVersion(datasetVersion)
                .orElseThrow(() -> new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_NOT_VALIDATED));
        if (!release.getNormalizedSha256().equals(artifact.manifest().normalizedSha256())) {
            throw new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_CHECKSUM_CONFLICT);
        }
        if (release.getStatus() != AdministrativeDatasetStatus.VALIDATED
                && release.getStatus() != AdministrativeDatasetStatus.ACTIVE) {
            throw new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_NOT_VALIDATED);
        }

        AdministrativeCatalogState state = catalogStates.findLockedBySingletonKey((byte) 1)
                .orElseGet(() -> {
                    AdministrativeCatalogState created = new AdministrativeCatalogState();
                    created.setSingletonKey((byte) 1);
                    return created;
                });
        if (state.getActiveRelease() != null
                && state.getActiveRelease().getId().equals(release.getId())
                && release.getStatus() == AdministrativeDatasetStatus.ACTIVE) {
            return AdministrativeDatasetRes.from(release);
        }

        importUnitsIfNeeded(release, artifact);
        if (state.getActiveRelease() != null && !state.getActiveRelease().getId().equals(release.getId())) {
            AdministrativeDatasetRelease previous = state.getActiveRelease();
            previous.setStatus(AdministrativeDatasetStatus.SUPERSEDED);
            releases.save(previous);
        }
        release.setStatus(AdministrativeDatasetStatus.ACTIVE);
        release.setActivatedBy(actor);
        release.setActivatedAt(LocalDateTime.now());
        releases.save(release);
        state.setActiveRelease(release);
        state.setUpdatedBy(actor);
        state.setUpdatedAt(LocalDateTime.now());
        catalogStates.save(state);
        return AdministrativeDatasetRes.from(release);
    }

    private void importUnitsIfNeeded(
            AdministrativeDatasetRelease release,
            AdministrativeDatasetValidator.ValidatedArtifact artifact) {
        long provinceCount = provinces.countByDatasetRelease(release);
        long communeCount = communes.countByDatasetRelease(release);
        if (provinceCount == 34 && communeCount == 3321) return;
        if (provinceCount != 0 || communeCount != 0) {
            throw new ApiException(
                    ErrorCode.ADMINISTRATIVE_DATASET_INVALID,
                    "Catalog đã được nhập dở; giao dịch kích hoạt đã bị hủy.");
        }

        List<AdministrativeProvince> provinceEntities = new ArrayList<>(34);
        for (var source : artifact.provinces()) {
            AdministrativeProvince province = new AdministrativeProvince();
            province.setDatasetRelease(release);
            province.setOfficialCode(source.code());
            province.setOfficialName(source.name());
            province.setUnitType(source.type());
            province.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
            province.setEffectiveFrom(source.effectiveFrom());
            provinceEntities.add(province);
        }
        provinceEntities = provinces.saveAll(provinceEntities);
        Map<String, AdministrativeProvince> provinceByCode = new HashMap<>();
        provinceEntities.forEach(province -> provinceByCode.put(province.getOfficialCode(), province));

        List<CommuneUnit> communeEntities = new ArrayList<>(3321);
        for (var source : artifact.communeUnits()) {
            CommuneUnit commune = new CommuneUnit();
            commune.setDatasetRelease(release);
            commune.setAdministrativeProvince(provinceByCode.get(source.provinceCode()));
            commune.setOfficialCode(source.code());
            commune.setOfficialName(source.name());
            commune.setUnitType(source.type());
            commune.setCatalogStatus(AdministrativeCatalogStatus.ACTIVE);
            commune.setEffectiveFrom(source.effectiveFrom());
            communeEntities.add(commune);
        }
        communes.saveAll(communeEntities);
        if (provinces.countByDatasetRelease(release) != 34 || communes.countByDatasetRelease(release) != 3321) {
            throw new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_INVALID, "Số lượng sau khi nhập không khớp.");
        }
    }

    private void applyManifest(
            AdministrativeDatasetRelease release,
            AdministrativeDatasetValidator.ValidatedArtifact artifact) {
        var manifest = artifact.manifest();
        release.setAuthority(manifest.authority());
        release.setDocumentNumber(manifest.documentNumber());
        release.setEffectiveDate(manifest.effectiveDate());
        release.setRetrievedAt(LocalDateTime.ofInstant(manifest.retrievedAt(), ZoneOffset.UTC));
        release.setSourceUrlsJson(json(manifest.sourceUrls()));
        release.setAttribution(manifest.attribution());
        release.setRawSha256(manifest.rawSha256());
        release.setNormalizedSha256(manifest.normalizedSha256());
        release.setTransformVersion(manifest.transformVersion());
        release.setExpectedProvinceCount(manifest.expectedProvinceCount());
        release.setExpectedCommuneCount(manifest.expectedCommuneCount());
        release.setActualProvinceCount(artifact.provinces().size());
        release.setActualCommuneCount(artifact.communeUnits().size());
    }

    private User actor(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài khoản quản trị."));
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
