package com.batdongsan.dto.analytics;

import java.util.List;

public record ListingStatisticsRes(
        Long listingId,
        String publicCode,
        long totalViews,
        long todayViews,
        long last7DaysViews,
        int periodDays,
        List<DailyViewRes> dailyViews) {}
