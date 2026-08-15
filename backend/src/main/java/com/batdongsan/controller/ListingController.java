package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.ListingFilter;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.PageReq;
import com.batdongsan.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {
    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingRes>>> searchListings(
            @Valid @ModelAttribute ListingFilter filter,
            @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(listingService.searchListings(filter,
                PageRequest.of(pageReq.getPage(), pageReq.getSize(), filter.toSort()))));
    }

    @GetMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<ListingRes>> getListing(@PathVariable String publicCode) {
        return ResponseEntity.ok(ApiResponse.success(listingService.getListingByPublicCode(publicCode)));
    }
}
