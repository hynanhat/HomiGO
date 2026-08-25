package com.batdongsan.controller;

import com.batdongsan.dto.*;
import com.batdongsan.dto.analytics.ListingStatisticsReq;
import com.batdongsan.dto.analytics.ListingStatisticsRes;
import com.batdongsan.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/seller/listings")
public class SellerListingController {
    private final ListingService listings; private final FileStorageService files;
    private final ListingAnalyticsService analytics;
    public SellerListingController(ListingService listings,FileStorageService files,ListingAnalyticsService analytics){this.listings=listings;this.files=files;this.analytics=analytics;}

    @PostMapping public ResponseEntity<ApiResponse<ListingRes>> create(@Valid @RequestBody ListingReq req,Authentication auth){
        return ResponseEntity.ok(ApiResponse.success(listings.createListing(auth.getName(),req)));}
    @GetMapping public ResponseEntity<ApiResponse<PageResponse<ListingRes>>> mine(@Valid @ModelAttribute PageReq page,Authentication auth){
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(listings.getMyListings(auth.getName(),PageRequest.of(page.getPage(),page.getSize(),Sort.by(Sort.Direction.DESC,"createdAt"))))));}
    @GetMapping("/{id}") public ResponseEntity<ApiResponse<ListingRes>> one(@PathVariable Long id,Authentication auth){return ResponseEntity.ok(ApiResponse.success(listings.getOwnedListing(id,auth.getName())));}
    @PutMapping("/{id}") public ResponseEntity<ApiResponse<ListingRes>> update(@PathVariable Long id,@Valid @RequestBody ListingReq req,Authentication auth){return ResponseEntity.ok(ApiResponse.success(listings.updateListing(id,auth.getName(),req)));}
    @DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id,Authentication auth){listings.deleteListing(id,auth.getName());return ResponseEntity.ok(ApiResponse.success(null));}
    @PostMapping("/{id}/submit") public ResponseEntity<ApiResponse<ListingRes>> submit(@PathVariable Long id,Authentication auth){return ResponseEntity.ok(ApiResponse.success(listings.submitListing(id,auth.getName())));}
    @PostMapping("/{id}/deactivate") public ResponseEntity<ApiResponse<ListingRes>> deactivate(@PathVariable Long id,Authentication auth){return ResponseEntity.ok(ApiResponse.success(listings.deactivateListing(id,auth.getName())));}
    @PostMapping("/{id}/images") public ResponseEntity<ApiResponse<ListingImageRes>> image(@PathVariable Long id,@RequestParam("file") MultipartFile file,Authentication auth){return ResponseEntity.ok(ApiResponse.success(new ListingImageRes(files.addImage(id,auth.getName(),file))));}
    @DeleteMapping("/{id}/images/{imageId}") public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id,@PathVariable Long imageId,Authentication auth){files.deleteImage(id,imageId,auth.getName());return ResponseEntity.ok(ApiResponse.success(null));}
    @GetMapping("/{id}/statistics") public ResponseEntity<ApiResponse<ListingStatisticsRes>> statistics(
            @PathVariable Long id,@Valid @ModelAttribute ListingStatisticsReq request,Authentication auth){
        return ResponseEntity.ok(ApiResponse.success(analytics.getSellerStatistics(id,auth.getName(),request.getDays())));}
}
