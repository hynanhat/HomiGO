package com.batdongsan.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ListingFileCleanupService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ListingFileCleanupService.class);

    private final Path root;

    public ListingFileCleanupService(@Value("${file.upload-dir:uploads}") String uploadDir) {
        root = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void deleteAfterCommit(ListingFilesDeletedEvent event) {
        event.storageKeys().forEach(this::deleteSafely);
    }

    private void deleteSafely(String storageKey) {
        Path target = root.resolve(storageKey).normalize();
        if (!target.startsWith(root)) {
            LOGGER.warn("Bỏ qua khóa tệp nằm ngoài thư mục upload: {}", storageKey);
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            LOGGER.error("Không thể dọn tệp ảnh sau khi xóa tin: {}", storageKey, exception);
        }
    }
}
