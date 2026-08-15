package com.batdongsan.repository;

import com.batdongsan.dto.ListingFilter;
import com.batdongsan.entity.*;
import com.batdongsan.repository.specification.ListingSpecifications;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql("/db/listing-search-fixture.sql")
class ListingSearchIntegrationTest {
    private static final LocalDateTime NOW=LocalDateTime.of(2026,8,14,0,0);
    @Autowired ListingRepository listings;

    @Test
    void publicSearchAlwaysExcludesNonActiveAndExpiredListings() {
        List<Listing> results=search(new ListingFilter());
        assertEquals(24,results.size());
        assertTrue(results.stream().allMatch(l->l.getStatus()==ListingStatus.ACTIVE));
        assertTrue(results.stream().allMatch(l->l.getExpiresAt()==null||l.getExpiresAt().isAfter(NOW)));
    }

    @Test
    void filtersByTransactionLocationWardCategoryAndProjectAttributes() {
        ListingFilter f=new ListingFilter();f.setTransactionType("BUY");f.setProvinceId(1001L);
        f.setDistrictId(1101L);f.setWardId(1111L);f.setCategoryId(2001L);f.setBedrooms(3);
        List<Listing> results=search(f);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(l->l.getCategory().getTransactionType()==TransactionType.BUY
                && l.getDistrict().getId().equals(1101L) && l.getWard().getId().equals(1111L)
                && l.getCategory().getId().equals(2001L) && l.getBedrooms()==3));
    }

    @Test
    void filtersByKeywordPriceAndAreaRanges() {
        ListingFilter f=new ListingFilter();f.setKeyword("căn hộ");
        f.setMinPrice(BigDecimal.valueOf(2_000_000_000L));f.setMaxPrice(BigDecimal.valueOf(7_000_000_000L));
        f.setMinArea(70.0);f.setMaxArea(130.0);
        List<Listing> results=search(f);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(l->(l.getTitle()+l.getDescription()+l.getAddress()).toLowerCase().contains("căn hộ")
                && l.getPrice().compareTo(f.getMinPrice())>=0 && l.getPrice().compareTo(f.getMaxPrice())<=0
                && l.getArea()>=70 && l.getArea()<=130));
    }

    @Test
    void filtersByMapBoundingBox() {
        ListingFilter f=new ListingFilter();f.setMinLat(10.77);f.setMaxLat(10.80);f.setMinLng(106.69);f.setMaxLng(106.72);
        List<Listing> results=search(f);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(l->l.getLatitude()>=10.77&&l.getLatitude()<=10.80
                && l.getLongitude()>=106.69&&l.getLongitude()<=106.72));
        assertTrue(results.stream().noneMatch(l->l.getDistrict().getProvince().getId().equals(1002L)));
    }

    @Test
    void supportsEveryWhitelistedSortAndStablePagination() {
        assertOrdered("newest",java.util.Comparator.comparing(Listing::getCreatedAt).reversed());
        assertOrdered("priceAsc",java.util.Comparator.comparing(Listing::getPrice));
        assertOrdered("priceDesc",java.util.Comparator.comparing(Listing::getPrice).reversed());
        assertOrdered("areaAsc",java.util.Comparator.comparing(Listing::getArea));
        assertOrdered("areaDesc",java.util.Comparator.comparing(Listing::getArea).reversed());
        ListingFilter f=new ListingFilter();
        var page=listings.findAll(ListingSpecifications.from(f,NOW),PageRequest.of(1,5,f.toSort()));
        assertEquals(24,page.getTotalElements());assertEquals(5,page.getContent().size());
    }

    private List<Listing> search(ListingFilter f){return listings.findAll(ListingSpecifications.from(f,NOW),
            PageRequest.of(0,100,f.toSort())).getContent();}
    private void assertOrdered(String sort,java.util.Comparator<Listing> comparator){ListingFilter f=new ListingFilter();f.setSort(sort);
        List<Listing> actual=search(f);List<Listing> expected=actual.stream().sorted(comparator.thenComparing(Listing::getId)).toList();
        assertEquals(expected.stream().map(Listing::getId).toList(),actual.stream().map(Listing::getId).toList());}
}
