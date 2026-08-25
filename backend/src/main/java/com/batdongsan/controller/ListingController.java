package com.batdongsan.controller;

import com.batdongsan.dto.ApiResponse;
import com.batdongsan.dto.ListingFilter;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.PageReq;
import com.batdongsan.dto.PageResponse;
import com.batdongsan.dto.analytics.ListingViewRecordedRes;
import com.batdongsan.dto.recommendation.RecommendationReq;
import com.batdongsan.dto.recommendation.RecommendationRes;
import com.batdongsan.service.ListingAnalyticsService;
import com.batdongsan.service.ListingService;
import com.batdongsan.service.RecommendationService;
import com.batdongsan.security.VisitorCookieService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {
    private final ListingService listingService;
    private final ListingAnalyticsService analyticsService;
    private final RecommendationService recommendationService;
    private final VisitorCookieService visitorCookieService;

    public ListingController(ListingService listingService, ListingAnalyticsService analyticsService,
                             RecommendationService recommendationService,
                             VisitorCookieService visitorCookieService) {
        this.listingService = listingService;
        this.analyticsService = analyticsService;
        this.recommendationService = recommendationService;
        this.visitorCookieService = visitorCookieService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ListingRes>>> searchListings(
            @Valid @ModelAttribute ListingFilter filter,
            @Valid @ModelAttribute PageReq pageReq) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(listingService.searchListings(filter,
                PageRequest.of(pageReq.getPage(), pageReq.getSize(), filter.toSort())))));
    }

    @GetMapping("/{publicCode}")
    public ResponseEntity<ApiResponse<ListingRes>> getListing(@PathVariable String publicCode) {
        return ResponseEntity.ok(ApiResponse.success(listingService.getListingByPublicCode(publicCode)));
    }

    @PostMapping("/{publicCode}/views")
    public ResponseEntity<ApiResponse<ListingViewRecordedRes>> recordView(
            @PathVariable String publicCode,
            @CookieValue(name = VisitorCookieService.COOKIE_NAME, required = false) String visitorCookie,
            Authentication authentication) {
        String email = authentication == null ? null : authentication.getName();
        var visitor = visitorCookieService.resolve(visitorCookie);
        var response = ResponseEntity.ok();
        if (visitor.cookie() != null) {
            response.header(HttpHeaders.SET_COOKIE, visitor.cookie().toString());
        }
        return response.body(ApiResponse.success(
                analyticsService.recordView(publicCode, visitor.id(), email)));
    }

    @GetMapping("/{publicCode}/recommendations")
    public ResponseEntity<ApiResponse<java.util.List<RecommendationRes>>> recommendations(
            @PathVariable String publicCode,
            @Valid @ModelAttribute RecommendationReq request) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getRecommendations(publicCode, request.getSize())));
    }
}
