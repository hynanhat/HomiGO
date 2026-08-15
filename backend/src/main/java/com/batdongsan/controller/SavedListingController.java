package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.PageReq;
import com.batdongsan.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/saved-listings")
public class SavedListingController {
    private final ListingService listingService;

    public SavedListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingRes>>> getSavedListings(
            @Valid @ModelAttribute PageReq pageReq, Authentication authentication) {
        PageRequest pageable = PageRequest.of(pageReq.getPage(), pageReq.getSize(),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return ResponseEntity.ok(ApiResponse.success(
                listingService.getSavedListings(authentication.getName(), pageable)));
    }

    @PostMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> saveListing(
            @PathVariable Long listingId, Authentication authentication) {
        listingService.saveListing(listingId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> unsaveListing(
            @PathVariable Long listingId, Authentication authentication) {
        listingService.unsaveListing(listingId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
