package com.batdongsan.service;

import com.batdongsan.dto.admin.BanUserReq;
import com.batdongsan.dto.admin.RejectListingReq;
import com.batdongsan.entity.*;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {
    @Mock ListingRepository listings;
    @Mock UserRepository users;
    @Mock CategoryRepository categories;
    @Mock RefreshTokenRepository refreshTokens;
    @Mock ListingStatusHistoryRepository histories;
    @Mock NotificationService notificationService;
    private AdminService service;
    private User admin;
    private User seller;

    @BeforeEach
    void setUp() {
        service = new AdminService(listings, users, categories, refreshTokens, histories, notificationService);
        admin = user(1L, "admin@example.com", UserRole.ADMIN);
        seller = user(2L, "seller@example.com", UserRole.SELLER);
    }

    @Test
    void approvePendingListingPublishesForThirtyDaysAndAuditsAdmin() {
        Listing listing = listing(ListingStatus.PENDING);
        when(listings.findById(10L)).thenReturn(Optional.of(listing));
        when(users.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(listings.saveAndFlush(listing)).thenReturn(listing);

        var result = service.approveListing(10L, admin.getEmail());

        assertEquals(ListingStatus.ACTIVE, listing.getStatus());
        assertEquals(admin, listing.getApprovedBy());
        assertNotNull(listing.getApprovedAt());
        assertEquals(listing.getApprovedAt(), listing.getPublishedAt());
        assertEquals(30, Duration.between(listing.getPublishedAt(), listing.getExpiresAt()).toDays());
        assertEquals("ACTIVE", result.getStatus());
        verify(histories).save(argThat(h -> h.getFromStatus() == ListingStatus.PENDING
                && h.getToStatus() == ListingStatus.ACTIVE && h.getChangedBy() == admin));
    }

    @Test
    void approveRejectsListingOutsidePendingState() {
        when(listings.findById(10L)).thenReturn(Optional.of(listing(ListingStatus.DRAFT)));
        when(users.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        assertThrows(BadRequestException.class, () -> service.approveListing(10L, admin.getEmail()));
        verify(listings, never()).saveAndFlush(any());
    }

    @Test
    void rejectPendingListingRequiresAndStoresReasonWithAudit() {
        Listing listing = listing(ListingStatus.PENDING);
        when(listings.findById(10L)).thenReturn(Optional.of(listing));
        when(users.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(listings.saveAndFlush(listing)).thenReturn(listing);
        RejectListingReq request = new RejectListingReq();
        request.setReason("Thông tin pháp lý chưa rõ ràng");

        var result = service.rejectListing(10L, admin.getEmail(), request);

        assertEquals(ListingStatus.REJECTED, listing.getStatus());
        assertEquals(request.getReason(), listing.getRejectionReason());
        assertEquals(request.getReason(), result.getRejectionReason());
        verify(histories).save(argThat(h -> h.getToStatus() == ListingStatus.REJECTED
                && request.getReason().equals(h.getReason())));
    }

    @Test
    void banRevokesSessionsAndDeactivatesAllActiveListingsTransactionally() {
        Listing first = listing(ListingStatus.ACTIVE);
        Listing second = listing(ListingStatus.ACTIVE);
        RefreshToken token = new RefreshToken(); token.setUser(seller); token.setTokenHash("a".repeat(64));
        token.setExpiresAt(LocalDateTime.now().plusDays(1));
        when(users.findById(seller.getId())).thenReturn(Optional.of(seller));
        when(users.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(listings.findByUserIdAndStatus(seller.getId(), ListingStatus.ACTIVE)).thenReturn(List.of(first, second));
        when(refreshTokens.findAllByUserIdAndRevokedAtIsNull(seller.getId())).thenReturn(List.of(token));
        BanUserReq request = new BanUserReq(); request.setReason("Đăng nội dung lừa đảo");

        service.banUser(seller.getId(), admin.getEmail(), request);

        assertEquals(UserStatus.BANNED, seller.getStatus());
        assertEquals(ListingStatus.INACTIVE, first.getStatus());
        assertEquals(ListingStatus.INACTIVE, second.getStatus());
        assertNotNull(token.getRevokedAt());
        verify(refreshTokens).saveAll(List.of(token));
        verify(listings).saveAll(List.of(first, second));
        verify(histories, times(2)).save(argThat(h -> h.getFromStatus() == ListingStatus.ACTIVE
                && h.getToStatus() == ListingStatus.INACTIVE && h.getChangedBy() == admin));
    }

    private User user(Long id, String email, UserRole role) {
        User user = new User(); user.setId(id); user.setName("User"); user.setEmail(email);
        user.setPasswordHash("hash"); user.setRole(role); user.setStatus(UserStatus.ACTIVE); return user;
    }

    private Listing listing(ListingStatus status) {
        Listing listing = new Listing(); listing.setId(10L); listing.setUser(seller); listing.setStatus(status);
        listing.setVersion(0L); return listing;
    }
}
