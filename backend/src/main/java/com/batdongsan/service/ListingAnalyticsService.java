package com.batdongsan.service;

import com.batdongsan.dto.analytics.*;
import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.entity.User;
import com.batdongsan.exception.ForbiddenException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.ListingRepository;
import com.batdongsan.repository.ListingViewRepository;
import com.batdongsan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.*;
import java.util.HexFormat;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class ListingAnalyticsService {
    private final ListingRepository listings;
    private final ListingViewRepository views;
    private final UserRepository users;
    private final byte[] hashSecret;
    private final ZoneId businessZone;

    public ListingAnalyticsService(ListingRepository listings, ListingViewRepository views, UserRepository users,
                                   @Value("${analytics.viewer-hash-secret}") String hashSecret,
                                   @Value("${app.business-zone:Asia/Ho_Chi_Minh}") String businessZone) {
        this.listings = listings;
        this.views = views;
        this.users = users;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
        this.businessZone = ZoneId.of(businessZone);
    }

    @Transactional
    public ListingViewRecordedRes recordView(String publicCode, String visitorId, String authenticatedEmail) {
        LocalDateTime now = LocalDateTime.now(businessZone);
        Listing listing = listings.findByPublicCodeAndStatus(publicCode, ListingStatus.ACTIVE)
                .filter(candidate -> candidate.getExpiresAt() == null || candidate.getExpiresAt().isAfter(now))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin đăng."));
        String viewerKey = authenticatedEmail == null || authenticatedEmail.isBlank()
                ? "anonymous:" + visitorId.toLowerCase()
                : "user:" + user(authenticatedEmail).getId();
        int inserted = views.insertIgnore(listing.getId(), hash(viewerKey), now.toLocalDate(), now);
        return new ListingViewRecordedRes(inserted > 0);
    }

    @Transactional(readOnly = true)
    public ListingStatisticsRes getSellerStatistics(Long listingId, String email, int days) {
        Listing listing = listing(listingId);
        if (!listing.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("Bạn không có quyền xem thống kê của tin đăng này.");
        }
        return statistics(listing, days);
    }

    @Transactional(readOnly = true)
    public ListingStatisticsRes getAdminStatistics(Long listingId, int days) {
        return statistics(listing(listingId), days);
    }

    private ListingStatisticsRes statistics(Listing listing, int days) {
        LocalDate today = LocalDate.now(businessZone);
        LocalDate start = today.minusDays(days - 1L);
        Map<LocalDate, Long> counts = views.countDaily(listing.getId(), start, today).stream()
                .collect(Collectors.toMap(ListingViewRepository.DailyViewCount::getViewedOn,
                        ListingViewRepository.DailyViewCount::getViewCount));
        var daily = IntStream.range(0, days)
                .mapToObj(offset -> {
                    LocalDate date = start.plusDays(offset);
                    return new DailyViewRes(date, counts.getOrDefault(date, 0L));
                })
                .toList();
        return new ListingStatisticsRes(
                listing.getId(),
                listing.getPublicCode(),
                views.countByListingId(listing.getId()),
                views.countByListingIdAndViewedOn(listing.getId(), today),
                views.countByListingIdAndViewedOnBetween(listing.getId(), today.minusDays(6), today),
                days,
                daily);
    }

    private String hash(String viewerKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hashSecret, "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(viewerKey.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Không thể bảo vệ mã khách xem.", exception);
        }
    }

    private Listing listing(Long listingId) {
        return listings.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin đăng."));
    }

    private User user(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
    }
}
