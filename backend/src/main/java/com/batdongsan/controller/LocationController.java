package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.location.AdministrativeProvinceRes;
import com.batdongsan.dto.location.CommuneUnitRes;
import com.batdongsan.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {
    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<PageResponse<AdministrativeProvinceRes>>> provinces(@Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(locationService.getActiveProvinces(page(pageReq)))));
    }

    @GetMapping("/provinces/{provinceCode}/commune-units")
    public ResponseEntity<ApiResponse<PageResponse<CommuneUnitRes>>> communeUnits(
            @PathVariable String provinceCode, @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(
                locationService.getActiveCommuneUnits(provinceCode, page(pageReq)))));
    }

    private PageRequest page(PageReq pageReq) {
        return PageRequest.of(pageReq.getPage(), pageReq.getSize(),
                Sort.by(Sort.Order.asc("officialName"), Sort.Order.asc("id")));
    }
}
