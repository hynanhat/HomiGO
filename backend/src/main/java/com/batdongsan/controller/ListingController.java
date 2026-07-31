package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.ListingFilter;
import com.batdongsan.dto.ListingReq;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.service.FileStorageService;
import com.batdongsan.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingRes>>> searchListings(
            @ModelAttribute ListingFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ListingRes> results = listingService.searchListings(filter, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingRes>> getListing(@PathVariable Long id) {
        ListingRes res = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ListingRes>> createListing(@Valid @RequestBody ListingReq req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ListingRes res = listingService.createListing(email, req);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingRes>> updateListing(@PathVariable Long id, @Valid @RequestBody ListingReq req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ListingRes res = listingService.updateListing(id, email, req);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        listingService.deleteListing(id, email);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    // Saved Listings
    @PostMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> saveListing(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        listingService.saveListing(id, email);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<ApiResponse<Void>> unsaveListing(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        listingService.unsaveListing(id, email);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<ListingRes>>> getSavedListings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ListingRes> res = listingService.getSavedListings(email);
        return ResponseEntity.ok(ApiResponse.success(res));
    }
}
