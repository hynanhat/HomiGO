package com.batdongsan.dto.admin.location;

import com.batdongsan.entity.AdministrativeDatasetRelease;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdministrativeDatasetRes(
        String datasetVersion,
        String authority,
        String documentNumber,
        LocalDate effectiveDate,
        String rawSha256,
        String normalizedSha256,
        int expectedProvinceCount,
        int expectedCommuneCount,
        Integer actualProvinceCount,
        Integer actualCommuneCount,
        String status,
        String validationSummary,
        LocalDateTime validatedAt,
        LocalDateTime activatedAt) {
    public static AdministrativeDatasetRes from(AdministrativeDatasetRelease release) {
        return new AdministrativeDatasetRes(
                release.getDatasetVersion(), release.getAuthority(), release.getDocumentNumber(),
                release.getEffectiveDate(), release.getRawSha256(), release.getNormalizedSha256(),
                release.getExpectedProvinceCount(), release.getExpectedCommuneCount(),
                release.getActualProvinceCount(), release.getActualCommuneCount(), release.getStatus().name(),
                release.getValidationSummaryJson(), release.getValidatedAt(), release.getActivatedAt());
    }
}
