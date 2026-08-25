package com.batdongsan.service;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.entity.User;
import com.batdongsan.exception.ForbiddenException;
import com.batdongsan.repository.ListingRepository;
import com.batdongsan.repository.ListingViewRepository;
import com.batdongsan.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingAnalyticsServiceTest {
    @Mock ListingRepository listings;
    @Mock ListingViewRepository views;
    @Mock UserRepository users;

    private ListingAnalyticsService service;
    private User owner;
    private Listing listing;

    @BeforeEach
    void setUp() {
        service = new ListingAnalyticsService(listings, views, users,
                "test-analytics-secret-with-at-least-32-bytes", "Asia/Ho_Chi_Minh");
        owner = new User(); owner.setId(1L); owner.setEmail("owner@example.com");
        listing = new Listing(); listing.setId(10L); listing.setPublicCode("HMG-ANALYTICS01");
        listing.setUser(owner); listing.setStatus(ListingStatus.ACTIVE);
        listing.setExpiresAt(LocalDateTime.now().plusDays(1));
    }

    @Test
    void anonymousViewIsHashedAndRecordedOnlyOnceByDatabaseConstraint() {
        String visitorId = "d1b70a08-f595-4e9a-a7d2-f10a6c23ca80";
        when(listings.findByPublicCodeAndStatus(listing.getPublicCode(), ListingStatus.ACTIVE))
                .thenReturn(Optional.of(listing));
        when(views.insertIgnore(eq(10L), anyString(), any(LocalDate.class), any(LocalDateTime.class)))
                .thenReturn(1, 0);

        assertTrue(service.recordView(listing.getPublicCode(), visitorId, null).recorded());
        assertFalse(service.recordView(listing.getPublicCode(), visitorId, null).recorded());

        ArgumentCaptor<String> hash = ArgumentCaptor.forClass(String.class);
        verify(views, times(2)).insertIgnore(eq(10L), hash.capture(), any(), any());
        assertEquals(64, hash.getAllValues().get(0).length());
        assertNotEquals(visitorId, hash.getAllValues().get(0));
        assertEquals(hash.getAllValues().get(0), hash.getAllValues().get(1));
    }

    @Test
    void authenticatedIdentityTakesPrecedenceOverVisitorId() {
        when(listings.findByPublicCodeAndStatus(listing.getPublicCode(), ListingStatus.ACTIVE))
                .thenReturn(Optional.of(listing));
        when(users.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(views.insertIgnore(eq(10L), anyString(), any(), any())).thenReturn(1);

        service.recordView(listing.getPublicCode(), "d1b70a08-f595-4e9a-a7d2-f10a6c23ca80", owner.getEmail());

        verify(users).findByEmail(owner.getEmail());
    }

    @Test
    void statisticsZeroFillMissingDatesAndExposeTotals() {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        when(listings.findById(10L)).thenReturn(Optional.of(listing));
        when(views.countByListingId(10L)).thenReturn(12L);
        when(views.countByListingIdAndViewedOn(10L, today)).thenReturn(2L);
        when(views.countByListingIdAndViewedOnBetween(eq(10L), any(), eq(today))).thenReturn(7L);
        ListingViewRepository.DailyViewCount day = mock(ListingViewRepository.DailyViewCount.class);
        when(day.getViewedOn()).thenReturn(today.minusDays(1));
        when(day.getViewCount()).thenReturn(3L);
        when(views.countDaily(eq(10L), any(), eq(today))).thenReturn(List.of(day));

        var result = service.getSellerStatistics(10L, owner.getEmail(), 7);

        assertEquals(12L, result.totalViews());
        assertEquals(2L, result.todayViews());
        assertEquals(7, result.dailyViews().size());
        assertEquals(0L, result.dailyViews().get(0).views());
        assertEquals(3L, result.dailyViews().get(5).views());
    }

    @Test
    void nonOwnerCannotReadSellerStatistics() {
        when(listings.findById(10L)).thenReturn(Optional.of(listing));
        assertThrows(ForbiddenException.class,
                () -> service.getSellerStatistics(10L, "other@example.com", 30));
        verifyNoInteractions(views);
    }
}
