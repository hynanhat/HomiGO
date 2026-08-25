package com.batdongsan.dto.analytics;

import java.time.LocalDate;

public record DailyViewRes(LocalDate date, long views) {}
