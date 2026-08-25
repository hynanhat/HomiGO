package com.batdongsan.dto.recommendation;

import com.batdongsan.dto.ListingRes;
import java.util.List;

public class RecommendationRes {
    private final ListingRes listing;
    private final int score;
    private final List<String> reasons;

    public RecommendationRes(ListingRes listing, int score, List<String> reasons) {
        this.listing = listing;
        this.score = score;
        this.reasons = List.copyOf(reasons);
    }

    public ListingRes getListing() { return listing; }
    public int getScore() { return score; }
    public List<String> getReasons() { return reasons; }
}
