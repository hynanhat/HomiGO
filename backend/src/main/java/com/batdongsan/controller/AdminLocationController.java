package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.admin.location.AdministrativeDatasetRes;
import com.batdongsan.dto.admin.location.ProductionCategoryInitializationRes;
import com.batdongsan.service.AdministrativeDatasetService;
import com.batdongsan.service.ProductionCategoryCatalogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminLocationController {
    private final AdministrativeDatasetService datasets;
    private final ProductionCategoryCatalogService categories;

    public AdminLocationController(
            AdministrativeDatasetService datasets,
            ProductionCategoryCatalogService categories) {
        this.datasets = datasets;
        this.categories = categories;
    }

    @GetMapping("/location-datasets")
    public ResponseEntity<ApiResponse<PageResponse<AdministrativeDatasetRes>>> datasetReleases(
            @Valid PageReq page) {
        var pageable = PageRequest.of(page.getPage(), page.getSize(), Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(datasets.list(pageable))));
    }

    @PostMapping("/location-datasets/{datasetVersion}/validate")
    public ResponseEntity<ApiResponse<AdministrativeDatasetRes>> validate(
            @PathVariable String datasetVersion,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                datasets.validateBundled(datasetVersion, authentication.getName())));
    }

    @PostMapping("/location-datasets/{datasetVersion}/activate")
    public ResponseEntity<ApiResponse<AdministrativeDatasetRes>> activate(
            @PathVariable String datasetVersion,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                datasets.activate(datasetVersion, authentication.getName())));
    }

    @PostMapping("/production-categories/{version}/initialize")
    public ResponseEntity<ApiResponse<ProductionCategoryInitializationRes>> initializeCategories(
            @PathVariable String version) {
        return ResponseEntity.ok(ApiResponse.success(categories.initialize(version)));
    }
}
