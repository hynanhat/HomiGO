package com.batdongsan.service;

import com.batdongsan.entity.*;
import com.batdongsan.repository.ListingRepository;
import com.batdongsan.support.CurrentLocationTestData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {
    @Mock ListingRepository listings;
    private RecommendationService service;
    private Category apartment;
    private AdministrativeProvince province;
    private CommuneUnit center;
    private Listing target;

    @BeforeEach
    void setUp() {
        service = new RecommendationService(listings);
        apartment = category(1L, "Căn hộ", TransactionType.BUY);
        province = CurrentLocationTestData.province(1L, "79", "Thành phố Hồ Chí Minh");
        center = commune(1L, "26734", "Phường Sài Gòn", province);
        target = listing(10L, "TARGET", apartment, center, 3_000_000_000L, 80, LocalDateTime.now().minusDays(1));
        when(listings.findByPublicCodeAndStatus("TARGET", ListingStatus.ACTIVE)).thenReturn(Optional.of(target));
    }

    @Test
    void closerCategoryLocationPriceAndAreaRanksFirstWithReasons() {
        Listing close = listing(11L, "CLOSE", apartment, center, 3_100_000_000L, 82, LocalDateTime.now());
        CommuneUnit outer = commune(2L, "27568", "Xã Củ Chi", province);
        Listing far = listing(12L, "FAR", apartment, outer, 5_800_000_000L, 150, LocalDateTime.now());
        stubCandidates(List.of(far, close));

        var result = service.getRecommendations("TARGET", 6);

        assertEquals(List.of(11L, 12L), result.stream().map(item -> item.getListing().getId()).toList());
        assertTrue(result.get(0).getScore() > result.get(1).getScore());
        assertTrue(result.get(0).getReasons().contains("Cùng phường/xã/đặc khu"));
        assertTrue(result.get(0).getReasons().contains("Mức giá tương đương"));
    }

    @Test
    void targetInactiveAndExpiredCandidatesAreDefensivelyExcluded() {
        Listing inactive = listing(13L, "INACTIVE", apartment, center, 3_000_000_000L, 80, LocalDateTime.now());
        inactive.setStatus(ListingStatus.INACTIVE);
        Listing expired = listing(14L, "EXPIRED", apartment, center, 3_000_000_000L, 80, LocalDateTime.now());
        expired.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        Listing valid = listing(15L, "VALID", apartment, center, 3_000_000_000L, 80, LocalDateTime.now());
        stubCandidates(List.of(target, inactive, expired, valid));

        assertEquals(List.of(15L), service.getRecommendations("TARGET", 6).stream()
                .map(item -> item.getListing().getId()).toList());
    }

    @Test
    void equalScoresUsePublicationTimeAndRespectLimit() {
        Listing older = listing(16L, "OLDER", apartment, center, 3_000_000_000L, 80, LocalDateTime.now().minusDays(2));
        Listing newest = listing(17L, "NEWEST", apartment, center, 3_000_000_000L, 80, LocalDateTime.now());
        Listing middle = listing(18L, "MIDDLE", apartment, center, 3_000_000_000L, 80, LocalDateTime.now().minusDays(1));
        stubCandidates(List.of(older, newest, middle));

        assertEquals(List.of(17L, 18L), service.getRecommendations("TARGET", 2).stream()
                .map(item -> item.getListing().getId()).toList());
    }

    private void stubCandidates(List<Listing> candidates) {
        when(listings.findRecommendationCandidates(eq(ListingStatus.ACTIVE), eq(10L), eq(1L),
                eq(TransactionType.BUY), eq(1L), eq(1L), isNull(), any(LocalDateTime.class), any(Pageable.class)))
                .thenReturn(candidates);
    }

    private Listing listing(Long id, String code, Category category, CommuneUnit commune,
                            long price, double area, LocalDateTime publishedAt) {
        User user = new User(); user.setId(id + 100); user.setName("Seller"); user.setEmail(code + "@example.com");
        Listing listing = new Listing(); listing.setId(id); listing.setPublicCode(code); listing.setUser(user);
        listing.setCategory(category); listing.setAdministrativeProvince(commune.getAdministrativeProvince());
        listing.setCommuneUnit(commune); listing.setTitle("Tin " + code);
        listing.setDescription("Mô tả"); listing.setPrice(BigDecimal.valueOf(price)); listing.setArea(area);
        listing.setAddress("Địa chỉ"); listing.setContactName("Seller"); listing.setContactPhone("0901234567");
        listing.setStatus(ListingStatus.ACTIVE); listing.setPublishedAt(publishedAt);
        listing.setExpiresAt(LocalDateTime.now().plusDays(10)); listing.setVersion(0L);
        return listing;
    }

    private Category category(Long id, String name, TransactionType transactionType) {
        Category category = new Category(); category.setId(id); category.setName(name);
        category.setSlug("category-" + id); category.setTransactionType(transactionType); return category;
    }

    private CommuneUnit commune(Long id, String code, String name, AdministrativeProvince province) {
        return CurrentLocationTestData.commune(id, code, name, province);
    }
}
