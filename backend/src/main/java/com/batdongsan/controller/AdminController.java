package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.entity.Category;
import com.batdongsan.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveListing(@PathVariable Long id) {
        adminService.approveListing(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectListing(@PathVariable Long id) {
        adminService.rejectListing(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable Long id) {
        adminService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable Long id) {
        adminService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category req) {
        Category category = adminService.createCategory(req);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id, @RequestBody Category req) {
        Category category = adminService.updateCategory(id, req);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
