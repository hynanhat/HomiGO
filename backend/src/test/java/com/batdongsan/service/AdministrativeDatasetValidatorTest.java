package com.batdongsan.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class AdministrativeDatasetValidatorTest {
    private final AdministrativeDatasetValidator validator =
            new AdministrativeDatasetValidator(new ObjectMapper().findAndRegisterModules());

    @Test
    void validatesPinnedOfficialCountsTypesParentsChecksumsAndIaMoCorrection() {
        var artifact = validator.validateBundled(AdministrativeDatasetValidator.BUNDLED_VERSION);

        assertThat(artifact.provinces()).hasSize(34);
        assertThat(artifact.communeUnits()).hasSize(3321);
        assertThat(artifact.communeUnits()).filteredOn(unit -> unit.type().name().equals("COMMUNE")).hasSize(2621);
        assertThat(artifact.communeUnits()).filteredOn(unit -> unit.type().name().equals("WARD")).hasSize(687);
        assertThat(artifact.communeUnits()).filteredOn(unit -> unit.type().name().equals("SPECIAL_ZONE")).hasSize(13);
        assertThat(artifact.communeUnits()).anySatisfy(unit -> {
            assertThat(unit.code()).isEqualTo("23938");
            assertThat(unit.provinceCode()).isEqualTo("52");
            assertThat(unit.name()).isEqualTo("Xã Ia Mơ");
        });
        assertThat(artifact.communeUnits()).noneMatch(unit -> unit.code().equals("23737"));
    }

    @Test
    void rejectsAnUnknownArtifactVersion() {
        assertThatThrownBy(() -> validator.validateBundled("untrusted"))
                .isInstanceOf(ApiException.class)
                .satisfies(error -> assertThat(((ApiException) error).getErrorCode())
                        .isEqualTo(ErrorCode.ADMINISTRATIVE_DATASET_INVALID));
    }
}
