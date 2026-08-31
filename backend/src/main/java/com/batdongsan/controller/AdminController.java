package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.admin.*;
import com.batdongsan.dto.analytics.ListingStatisticsReq;
import com.batdongsan.dto.analytics.ListingStatisticsRes;
import com.batdongsan.dto.project.ProjectFilter;
import com.batdongsan.dto.project.ProjectReq;
import com.batdongsan.dto.project.ProjectSummaryRes;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.service.AdminService;
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
    private final ListingAnalyticsService analyticsService;

    public AdminController(AdminService adminService, ProjectService projectService,
                           ListingAnalyticsService analyticsService) {
        this.adminService = adminService;
        this.projectService = projectService;
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
    public ResponseEntity<ApiResponse<AdminListingRes>> approve(
            @PathVariable Long id, @Valid @RequestBody ApproveListingReq request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.approveListing(id, auth.getName(), request)));
    }

    @PostMapping("/listings/{id}/reject")
    public ResponseEntity<ApiResponse<AdminListingRes>> reject(
            @PathVariable Long id, @Valid @RequestBody RejectListingReq request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(adminService.rejectListing(id, auth.getName(), request)));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<AdminListingDetailRes>> listing(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getListing(id)));
    }

    @PostMapping("/listings/{id}/remove")
    public ResponseEntity<ApiResponse<AdminListingRes>> remove(
            @PathVariable Long id, @Valid @RequestBody RemoveListingReq request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                adminService.removeListing(id, auth.getName(), request)));
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

    private PageRequest page(PageReq page) {
        return PageRequest.of(page.getPage(), page.getSize(), Sort.by("id").ascending());
    }
}
