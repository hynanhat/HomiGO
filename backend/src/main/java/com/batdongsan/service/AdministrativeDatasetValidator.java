package com.batdongsan.service;

import com.batdongsan.entity.AdministrativeProvinceType;
import com.batdongsan.entity.CommuneUnitType;
import com.batdongsan.exception.ApiException;
import com.batdongsan.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class AdministrativeDatasetValidator {
    public static final String BUNDLED_VERSION = "vn-administrative-units-2025-07-01";
    private static final String ROOT = "administrative-data/" + BUNDLED_VERSION + "/";

    private final ObjectMapper objectMapper;
    private final ObjectMapper canonicalObjectMapper;

    public AdministrativeDatasetValidator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper.copy().findAndRegisterModules();
        this.canonicalObjectMapper = this.objectMapper.copy()
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public ValidatedArtifact validateBundled(String requestedVersion) {
        if (!BUNDLED_VERSION.equals(requestedVersion)) {
            throw invalid("Không có artifact hành chính cho phiên bản " + requestedVersion + ".");
        }
        try {
            byte[] manifestBytes = read("manifest.json");
            byte[] provinceBytes = read("provinces.json");
            byte[] communeBytes = read("commune-units.json");
            Manifest manifest = objectMapper.readValue(manifestBytes, Manifest.class);
            List<ProvinceArtifact> provinces = objectMapper.readerForListOf(ProvinceArtifact.class)
                    .readValue(provinceBytes);
            List<CommuneArtifact> communes = objectMapper.readerForListOf(CommuneArtifact.class)
                    .readValue(communeBytes);
            validate(manifest, provinces, communes, provinceBytes, communeBytes);
            return new ValidatedArtifact(manifest, List.copyOf(provinces), List.copyOf(communes));
        } catch (ApiException exception) {
            throw exception;
        } catch (IOException | RuntimeException exception) {
            throw invalid("Không thể đọc artifact hành chính đã đóng gói.");
        }
    }

    private void validate(
            Manifest manifest,
            List<ProvinceArtifact> provinces,
            List<CommuneArtifact> communes,
            byte[] provinceBytes,
            byte[] communeBytes) throws IOException {
        require(BUNDLED_VERSION.equals(manifest.datasetVersion()), "Sai phiên bản artifact.");
        require(manifest.expectedProvinceCount() == 34 && provinces.size() == 34,
                "Danh mục phải có đúng 34 tỉnh/thành phố.");
        require(manifest.expectedCommuneCount() == 3321 && communes.size() == 3321,
                "Danh mục phải có đúng 3.321 đơn vị cấp xã.");
        require(sha256(provinceBytes).equals(manifest.provinceSha256()), "Checksum tỉnh/thành phố không khớp.");
        require(sha256(communeBytes).equals(manifest.communeSha256()), "Checksum phường/xã/đặc khu không khớp.");
        require(manifest.rawSha256() != null && manifest.rawSha256().matches("[a-f0-9]{64}"),
                "Checksum tài liệu nguồn không hợp lệ.");
        require(manifest.sourceUrls() != null && manifest.sourceUrls().size() >= 2,
                "Thiếu nguồn dữ liệu chính thức.");

        byte[] canonical = canonicalObjectMapper.writeValueAsBytes(new CanonicalCatalog(provinces, communes));
        require(sha256(canonical).equals(manifest.normalizedSha256()), "Checksum catalog chuẩn hóa không khớp.");

        Set<String> provinceCodes = new HashSet<>();
        Map<AdministrativeProvinceType, Integer> provinceTypeCounts = new HashMap<>();
        for (ProvinceArtifact province : provinces) {
            require(province.code() != null && province.code().matches("\\d{2}"), "Mã tỉnh không hợp lệ.");
            require(provinceCodes.add(province.code()), "Mã tỉnh bị trùng: " + province.code());
            require(province.name() != null && !province.name().isBlank(), "Tên tỉnh bị trống.");
            require(Normalizer.isNormalized(province.name(), Normalizer.Form.NFC),
                    "Tên tỉnh không ở dạng Unicode NFC: " + province.code());
            require(province.effectiveFrom().equals(manifest.effectiveDate()),
                    "Ngày hiệu lực tỉnh không khớp: " + province.code());
            require((province.type() == AdministrativeProvinceType.PROVINCE && province.name().startsWith("Tỉnh "))
                            || (province.type() == AdministrativeProvinceType.CENTRAL_MUNICIPALITY
                            && province.name().startsWith("Thành phố ")),
                    "Loại tỉnh/thành phố không khớp tên: " + province.code());
            provinceTypeCounts.merge(province.type(), 1, Integer::sum);
        }
        require(provinceTypeCounts.getOrDefault(AdministrativeProvinceType.PROVINCE, 0) == 28,
                "Sai số lượng tỉnh.");
        require(provinceTypeCounts.getOrDefault(AdministrativeProvinceType.CENTRAL_MUNICIPALITY, 0) == 6,
                "Sai số lượng thành phố trực thuộc trung ương.");

        Set<String> communeCodes = new HashSet<>();
        Map<CommuneUnitType, Integer> typeCounts = new HashMap<>();
        Map<String, Integer> childCounts = new HashMap<>();
        for (CommuneArtifact commune : communes) {
            require(commune.code() != null && commune.code().matches("\\d{5}"), "Mã cấp xã không hợp lệ.");
            require(communeCodes.add(commune.code()), "Mã cấp xã bị trùng: " + commune.code());
            require(provinceCodes.contains(commune.provinceCode()), "Đơn vị không có tỉnh cha: " + commune.code());
            require(commune.name() != null && !commune.name().isBlank(), "Tên đơn vị bị trống.");
            require(Normalizer.isNormalized(commune.name(), Normalizer.Form.NFC),
                    "Tên đơn vị không ở dạng Unicode NFC: " + commune.code());
            require(commune.effectiveFrom().equals(manifest.effectiveDate()),
                    "Ngày hiệu lực đơn vị không khớp: " + commune.code());
            require((commune.type() == CommuneUnitType.COMMUNE && commune.name().startsWith("Xã "))
                            || (commune.type() == CommuneUnitType.WARD && commune.name().startsWith("Phường "))
                            || (commune.type() == CommuneUnitType.SPECIAL_ZONE
                            && commune.name().startsWith("Đặc khu ")),
                    "Loại đơn vị cấp xã không khớp tên: " + commune.code());
            typeCounts.merge(commune.type(), 1, Integer::sum);
            childCounts.merge(commune.provinceCode(), 1, Integer::sum);
        }
        require(typeCounts.getOrDefault(CommuneUnitType.COMMUNE, 0) == 2621, "Sai số lượng xã.");
        require(typeCounts.getOrDefault(CommuneUnitType.WARD, 0) == 687, "Sai số lượng phường.");
        require(typeCounts.getOrDefault(CommuneUnitType.SPECIAL_ZONE, 0) == 13, "Sai số lượng đặc khu.");
        require(provinceCodes.stream().allMatch(childCounts::containsKey),
                "Có tỉnh/thành phố không có đơn vị cấp xã trực thuộc.");
        require(manifest.expectedTypeCounts() != null
                        && manifest.expectedTypeCounts().getOrDefault("COMMUNE", -1) == 2621
                        && manifest.expectedTypeCounts().getOrDefault("WARD", -1) == 687
                        && manifest.expectedTypeCounts().getOrDefault("SPECIAL_ZONE", -1) == 13,
                "Số lượng theo loại trong manifest không khớp.");
        require(communes.stream().anyMatch(unit -> unit.code().equals("23938")
                        && unit.provinceCode().equals("52") && unit.name().equals("Xã Ia Mơ")),
                "Thiếu đính chính chính thức Xã Ia Mơ mã 23938.");
        require(communes.stream().noneMatch(unit -> unit.code().equals("23737")),
                "Artifact còn chứa mã Ia Mơ sai đã bị đóng 23737.");
    }

    private byte[] read(String name) throws IOException {
        return new ClassPathResource(ROOT + name).getInputStream().readAllBytes();
    }

    private static String sha256(byte[] value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static void require(boolean valid, String message) {
        if (!valid) throw invalid(message);
    }

    private static ApiException invalid(String message) {
        return new ApiException(ErrorCode.ADMINISTRATIVE_DATASET_INVALID, message);
    }

    public record Manifest(
            String datasetVersion,
            String authority,
            String documentNumber,
            LocalDate effectiveDate,
            Instant retrievedAt,
            List<String> sourceUrls,
            String attribution,
            String transformVersion,
            String rawSha256,
            String normalizedSha256,
            String provinceSha256,
            String communeSha256,
            int expectedProvinceCount,
            int expectedCommuneCount,
            Map<String, Integer> expectedTypeCounts) {}

    public record ProvinceArtifact(
            String code,
            String name,
            AdministrativeProvinceType type,
            LocalDate effectiveFrom) {}

    public record CommuneArtifact(
            String code,
            String provinceCode,
            String name,
            CommuneUnitType type,
            LocalDate effectiveFrom) {}

    public record ValidatedArtifact(
            Manifest manifest,
            List<ProvinceArtifact> provinces,
            List<CommuneArtifact> communeUnits) {}

    private record CanonicalCatalog(
            List<ProvinceArtifact> provinces,
            List<CommuneArtifact> communeUnits) {}
}
