package com.batdongsan.service;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.User;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ForbiddenException;
import com.batdongsan.repository.ListingImageRepository;
import com.batdongsan.repository.ListingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class FileStorageServiceTest {
    @TempDir Path uploadDir;

    @Test
    void rejectsEmptyOversizedInvalidMimeAndTraversalFiles() {
        Fixture f = fixture();
        assertThrows(BadRequestException.class, () -> f.service.addImage(1L, "owner@example.com",
                new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[0])));
        assertThrows(BadRequestException.class, () -> f.service.addImage(1L, "owner@example.com",
                new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[5 * 1024 * 1024 + 1])));
        assertThrows(BadRequestException.class, () -> f.service.addImage(1L, "owner@example.com",
                new MockMultipartFile("file", "a.gif", "image/gif", new byte[]{1})));
        assertThrows(BadRequestException.class, () -> f.service.addImage(1L, "owner@example.com",
                new MockMultipartFile("file", "../a.jpg", "image/jpeg", new byte[]{1})));
    }

    @Test
    void rejectsNonOwnerAndEleventhImage() {
        Fixture f = fixture();
        Listing listing = listing();
        when(f.listingRepository.findById(1L)).thenReturn(Optional.of(listing));
        MockMultipartFile image = new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[]{1});

        assertThrows(ForbiddenException.class, () -> f.service.addImage(1L, "other@example.com", image));
        when(f.imageRepository.countByListingId(1L)).thenReturn(10L);
        assertThrows(BadRequestException.class, () -> f.service.addImage(1L, "owner@example.com", image));
        verify(f.imageRepository, never()).save(Mockito.any());
    }

    private Fixture fixture() {
        ListingRepository listings = mock(ListingRepository.class);
        ListingImageRepository images = mock(ListingImageRepository.class);
        return new Fixture(new FileStorageService(uploadDir.toString(), listings, images), listings, images);
    }

    private Listing listing() {
        User owner = new User(); owner.setEmail("owner@example.com");
        Listing listing = new Listing(); listing.setId(1L); listing.setUser(owner);
        return listing;
    }

    private record Fixture(FileStorageService service, ListingRepository listingRepository,
                           ListingImageRepository imageRepository) {}
}
