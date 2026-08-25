package com.batdongsan.service;

import java.util.List;

public record ListingFilesDeletedEvent(List<String> storageKeys) {
    public ListingFilesDeletedEvent {
        storageKeys = List.copyOf(storageKeys);
    }
}
