package com.batdongsan.service;

import com.batdongsan.dto.ListingRes;
import com.batdongsan.dto.recommendation.RecommendationRes;
import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.ListingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class RecommendationService {
    private static final int CANDIDATE_LIMIT = 200;
    private final ListingRepository listings;

    public RecommendationService(ListingRepository listings) {
        this.listings = listings;
    }

    @Transactional(readOnly = true)
    public List<RecommendationRes> getRecommendations(String publicCode, int size) {
        LocalDateTime now = LocalDateTime.now();
        Listing target = listings.findByPublicCodeAndStatus(publicCode, ListingStatus.ACTIVE)
                .filter(listing -> listing.getExpiresAt() == null || listing.getExpiresAt().isAfter(now))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin đăng."));

        Long projectId = target.getProject() == null ? null : target.getProject().getId();
        List<Listing> candidates = listings.findRecommendationCandidates(
                ListingStatus.ACTIVE,
                target.getId(),
                target.getCategory().getId(),
                target.getCategory().getTransactionType(),
                target.getCommuneUnit().getId(),
                target.getAdministrativeProvince().getId(),
                projectId,
                now,
                PageRequest.of(0, CANDIDATE_LIMIT));

        return candidates.stream()
                .filter(candidate -> !Objects.equals(candidate.getId(), target.getId()))
                .filter(candidate -> candidate.getStatus() == ListingStatus.ACTIVE)
                .filter(candidate -> candidate.getExpiresAt() == null || candidate.getExpiresAt().isAfter(now))
                .map(candidate -> score(target, candidate))
                .sorted(Comparator.comparingInt(ScoredRecommendation::score).reversed()
                        .thenComparing(ScoredRecommendation::publishedAt,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(ScoredRecommendation::listingId, Comparator.reverseOrder()))
                .limit(size)
                .map(ScoredRecommendation::response)
                .toList();
    }

    private ScoredRecommendation score(Listing target, Listing candidate) {
        double score = 0;
        List<String> reasons = new ArrayList<>();

        boolean sameCategory = Objects.equals(target.getCategory().getId(), candidate.getCategory().getId());
        if (sameCategory) {
            score += 30;
            reasons.add("Cùng loại bất động sản");
        }

        if (target.getCategory().getTransactionType() == candidate.getCategory().getTransactionType()) {
            score += 15;
            if (!sameCategory) reasons.add("Cùng nhu cầu giao dịch");
        }

        if (Objects.equals(target.getCommuneUnit().getId(), candidate.getCommuneUnit().getId())) {
            score += 20;
            reasons.add("Cùng phường/xã/đặc khu");
        } else if (Objects.equals(target.getAdministrativeProvince().getId(),
                candidate.getAdministrativeProvince().getId())) {
            score += 8;
            reasons.add("Cùng tỉnh/thành phố");
        }

        if (target.getProject() != null && candidate.getProject() != null
                && Objects.equals(target.getProject().getId(), candidate.getProject().getId())) {
            score += 15;
            reasons.add("Cùng dự án");
        }

        double priceProximity = proximity(target.getPrice(), candidate.getPrice());
        score += 12 * priceProximity;
        if (priceProximity >= 0.8) reasons.add("Mức giá tương đương");

        double areaProximity = proximity(target.getArea(), candidate.getArea());
        score += 8 * areaProximity;
        if (areaProximity >= 0.8) reasons.add("Diện tích tương đương");

        RecommendationRes response = new RecommendationRes(
                new ListingRes(candidate),
                Math.max(0, Math.min(100, (int) Math.round(score))),
                reasons.stream().distinct().limit(3).toList());
        return new ScoredRecommendation(response, response.getScore(), candidate.getPublishedAt(), candidate.getId());
    }

    private double proximity(BigDecimal target, BigDecimal candidate) {
        if (target == null || candidate == null || target.signum() <= 0) return 0;
        double difference = candidate.subtract(target).abs().divide(target, 8, java.math.RoundingMode.HALF_UP).doubleValue();
        return Math.max(0, 1 - Math.min(1, difference));
    }

    private double proximity(Double target, Double candidate) {
        if (target == null || candidate == null || target <= 0) return 0;
        return Math.max(0, 1 - Math.min(1, Math.abs(candidate - target) / target));
    }

    private record ScoredRecommendation(
            RecommendationRes response,
            int score,
            LocalDateTime publishedAt,
            Long listingId) {}
}
