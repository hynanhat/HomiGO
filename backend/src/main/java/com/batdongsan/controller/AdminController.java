package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.admin.*;
import com.batdongsan.dto.analytics.ListingStatisticsReq;
import com.batdongsan.dto.analytics.ListingStatisticsRes;
import com.batdongsan.dto.location.*;
import com.batdongsan.dto.project.ProjectFilter;
import com.batdongsan.dto.project.ProjectReq;
import com.batdongsan.dto.project.ProjectSummaryRes;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.service.AdminService;
import com.batdongsan.service.LocationService;
import com.batdongsan.service.ListingAnalyticsService;
import com.batdongsan.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService adminService;
    private final ProjectService projectService;
    private final LocationService locationService;
    private final ListingAnalyticsService analyticsService;

    public AdminController(AdminService adminService, ProjectService projectService,
                           LocationService locationService, ListingAnalyticsService analyticsService) {
        this.adminService = adminService;
        this.projectService = projectService;
        this.locationService = locationService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<PageResponse<AdminListingRes>>> listings(
            @RequestParam(defaultValue = "PENDING") ListingStatus status,
            @Valid @ModelAttribute PageReq page) {
        Pageable pageable = PageRequest.of(page.getPage(), page.getSize(), Sort.by("createdAt").ascending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(adminService.getListings(status, pageable))));
    }

    @PostMapping("/listings/{id}/approve")
    public ResponseEntity<ApiResponse<AdminListingRes>> approve(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(adminService.approveListing(id, auth.getName())));
    }

    @PostMapping("/listings/{id}/reject")
    public ResponseEntity<ApiResponse<AdminListingRes>> reject(
            @PathVariable Long id, @Valid @RequestBody RejectListingReq request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(adminService.rejectListing(id, auth.getName(), request)));
    }

    @GetMapping("/listings/{id}/statistics")
    public ResponseEntity<ApiResponse<ListingStatisticsRes>> listingStatistics(
            @PathVariable Long id, @Valid @ModelAttribute ListingStatisticsReq request) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getAdminStatistics(id, request.getDays())));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserRes>>> users(@Valid @ModelAttribute PageReq page) {
        Pageable pageable = PageRequest.of(page.getPage(), page.getSize(), Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(adminService.getUsers(pageable))));
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<AdminUserRes>> ban(
            @PathVariable Long id, @Valid @RequestBody BanUserReq request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(adminService.banUser(id, auth.getName(), request)));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<AdminUserRes>> unban(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.unbanUser(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<PageResponse<CategoryRes>>> categories(@Valid @ModelAttribute PageReq page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(adminService.getCategories(page(page)))));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryRes>> createCategory(@Valid @RequestBody CategoryReq request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.createCategory(request)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryRes>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryReq request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateCategory(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<PageResponse<ProjectSummaryRes>>> projects(
            @Valid @ModelAttribute ProjectFilter filter, @Valid @ModelAttribute PageReq page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(projectService.getProjects(filter, page(page)))));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectSummaryRes>> createProject(@Valid @RequestBody ProjectReq request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.createProject(request)));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectSummaryRes>> updateProject(
            @PathVariable Long id, @Valid @RequestBody ProjectReq request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.updateProject(id, request)));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/locations/provinces")
    public ResponseEntity<ApiResponse<PageResponse<ProvinceRes>>> provinces(@Valid @ModelAttribute PageReq page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(locationService.getProvinces(page(page)))));
    }

    @PostMapping("/locations/provinces")
    public ResponseEntity<ApiResponse<ProvinceRes>> createProvince(@Valid @RequestBody ProvinceReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.createProvince(request)));
    }

    @PutMapping("/locations/provinces/{id}")
    public ResponseEntity<ApiResponse<ProvinceRes>> updateProvince(
            @PathVariable Long id, @Valid @RequestBody ProvinceReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.updateProvince(id, request)));
    }

    @DeleteMapping("/locations/provinces/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvince(@PathVariable Long id) {
        locationService.deleteProvince(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/locations/districts")
    public ResponseEntity<ApiResponse<PageResponse<DistrictRes>>> districts(@Valid @ModelAttribute PageReq page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(locationService.getAllDistricts(page(page)))));
    }

    @PostMapping("/locations/districts")
    public ResponseEntity<ApiResponse<DistrictRes>> createDistrict(@Valid @RequestBody DistrictReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.createDistrict(request)));
    }

    @PutMapping("/locations/districts/{id}")
    public ResponseEntity<ApiResponse<DistrictRes>> updateDistrict(
            @PathVariable Long id, @Valid @RequestBody DistrictReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.updateDistrict(id, request)));
    }

    @DeleteMapping("/locations/districts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDistrict(@PathVariable Long id) {
        locationService.deleteDistrict(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/locations/wards")
    public ResponseEntity<ApiResponse<PageResponse<WardRes>>> wards(@Valid @ModelAttribute PageReq page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(locationService.getAllWards(page(page)))));
    }

    @PostMapping("/locations/wards")
    public ResponseEntity<ApiResponse<WardRes>> createWard(@Valid @RequestBody WardReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.createWard(request)));
    }

    @PutMapping("/locations/wards/{id}")
    public ResponseEntity<ApiResponse<WardRes>> updateWard(
            @PathVariable Long id, @Valid @RequestBody WardReq request) {
        return ResponseEntity.ok(ApiResponse.success(locationService.updateWard(id, request)));
    }

    @DeleteMapping("/locations/wards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWard(@PathVariable Long id) {
        locationService.deleteWard(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private PageRequest page(PageReq page) {
        return PageRequest.of(page.getPage(), page.getSize(), Sort.by("id").ascending());
    }
}
