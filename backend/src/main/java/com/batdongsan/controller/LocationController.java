package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.location.DistrictRes;
import com.batdongsan.dto.location.ProvinceRes;
import com.batdongsan.dto.location.WardRes;
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
    public ResponseEntity<ApiResponse<PageResponse<ProvinceRes>>> provinces(@Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(locationService.getProvinces(page(pageReq)))));
    }

    @GetMapping("/provinces/{provinceId}/districts")
    public ResponseEntity<ApiResponse<PageResponse<DistrictRes>>> districts(
            @PathVariable Long provinceId, @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(
                locationService.getDistricts(provinceId, page(pageReq)))));
    }

    @GetMapping("/districts/{districtId}/wards")
    public ResponseEntity<ApiResponse<PageResponse<WardRes>>> wards(
            @PathVariable Long districtId, @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(
                locationService.getWards(districtId, page(pageReq)))));
    }

    private PageRequest page(PageReq pageReq) {
        return PageRequest.of(pageReq.getPage(), pageReq.getSize(),
                Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id")));
    }
}
