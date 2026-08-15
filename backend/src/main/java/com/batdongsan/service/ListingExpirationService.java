package com.batdongsan.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ListingExpirationService {
    private final ListingService listings;
    public ListingExpirationService(ListingService listings){this.listings=listings;}
    @Scheduled(cron="${listing.expiration-cron:0 0 1 * * *}")
    public void expireListings(){listings.expireDueListings(LocalDateTime.now());}
}
