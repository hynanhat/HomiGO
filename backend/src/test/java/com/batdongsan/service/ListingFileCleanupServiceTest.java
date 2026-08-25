package com.batdongsan.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;

class ListingFileCleanupServiceTest {

    @TempDir
    Path uploadDir;

    @Test
    void removesCommittedListingFiles() throws Exception {
        Path first = Files.writeString(uploadDir.resolve("first.jpg"), "image");
        Path second = Files.writeString(uploadDir.resolve("second.webp"), "image");
        ListingFileCleanupService service = new ListingFileCleanupService(uploadDir.toString());

        service.deleteAfterCommit(new ListingFilesDeletedEvent(List.of("first.jpg", "second.webp")));

        assertFalse(Files.exists(first));
        assertFalse(Files.exists(second));
    }
}
