package com.batdongsan.service;

import com.batdongsan.entity.Listing;
import com.batdongsan.entity.ListingImage;
import com.batdongsan.entity.ListingStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ForbiddenException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.ListingImageRepository;
import com.batdongsan.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};

    private final Path root;
    private final ListingRepository listings;
    private final ListingImageRepository images;
    private final ApplicationEventPublisher eventPublisher;

    public FileStorageService(
            @Value("${file.upload-dir:uploads}") String dir,
            ListingRepository listings,
            ListingImageRepository images,
            ApplicationEventPublisher eventPublisher) {
        this.root = Paths.get(dir).toAbsolutePath().normalize();
        this.listings = listings;
        this.images = images;
        this.eventPublisher = eventPublisher;
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể tạo thư mục lưu ảnh.", exception);
        }
    }

    @Transactional
    public ListingImage addImage(Long listingId, String email, MultipartFile file) {
        DetectedImage detected = validateAndRead(file);
        Listing listing = ownedEditable(listingId, email);
        long count = images.countByListingId(listingId);
        if (count >= 10) {
            throw new BadRequestException("Mỗi tin đăng chỉ được có tối đa 10 ảnh.");
        }

        String key = UUID.randomUUID() + detected.extension();
        Path target = resolve(key);
        try {
            Files.write(target, detected.bytes(), StandardOpenOption.CREATE_NEW);
            deleteFileIfTransactionRollsBack(target);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể lưu ảnh.", exception);
        }

        try {
            ListingImage image = new ListingImage();
            image.setListing(listing);
            image.setStorageKey(key);
            image.setUrl("/uploads/" + key);
            image.setContentType(detected.contentType());
            image.setSizeBytes((long) detected.bytes().length);
            image.setSortOrder((int) count);
            return images.save(image);
        } catch (RuntimeException exception) {
            deleteQuietly(target);
            throw exception;
        }
    }

    @Transactional
    public void deleteImage(Long listingId, Long imageId, String email) {
        ownedEditable(listingId, email);
        ListingImage image = images.findByIdAndListingId(imageId, listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh."));
        images.delete(image);
        eventPublisher.publishEvent(new ListingFilesDeletedEvent(List.of(image.getStorageKey())));
    }

    private DetectedImage validateAndRead(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tệp ảnh không được để trống.");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BadRequestException("Ảnh không được vượt quá 5 MB.");
        }
        String original = file.getOriginalFilename();
        if (original != null && (original.contains("..") || original.contains("/") || original.contains("\\"))) {
            throw new BadRequestException("Tên tệp không hợp lệ.");
        }

        try {
            byte[] bytes = file.getBytes();
            if (bytes.length == 0 || bytes.length > MAX_SIZE) {
                throw new BadRequestException("Ảnh không được để trống hoặc vượt quá 5 MB.");
            }
            if (isJpeg(bytes)) return new DetectedImage(bytes, "image/jpeg", ".jpg");
            if (startsWith(bytes, PNG_SIGNATURE)) return new DetectedImage(bytes, "image/png", ".png");
            if (isWebp(bytes)) return new DetectedImage(bytes, "image/webp", ".webp");
            throw new BadRequestException("Nội dung tệp không phải ảnh JPEG, PNG hoặc WebP hợp lệ.");
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đọc tệp ảnh.", exception);
        }
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && bytes[0] == (byte) 0xff
                && bytes[1] == (byte) 0xd8
                && bytes[2] == (byte) 0xff;
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && ascii(bytes, 0, "RIFF")
                && ascii(bytes, 8, "WEBP");
    }

    private boolean ascii(byte[] bytes, int offset, String value) {
        for (int index = 0; index < value.length(); index++) {
            if (bytes[offset + index] != (byte) value.charAt(index)) return false;
        }
        return true;
    }

    private boolean startsWith(byte[] bytes, byte[] signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if (bytes[index] != signature[index]) return false;
        }
        return true;
    }

    private Listing owned(Long id, String email) {
        Listing listing = listings.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin đăng."));
        if (!listing.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("Bạn không có quyền thay đổi ảnh của tin này.");
        }
        return listing;
    }

    private Listing ownedEditable(Long id, String email) {
        Listing listing = owned(id, email);
        if (!EnumSet.of(ListingStatus.DRAFT, ListingStatus.REJECTED, ListingStatus.INACTIVE)
                .contains(listing.getStatus())) {
            throw new BadRequestException("Chỉ có thể thay đổi ảnh của tin nháp, bị từ chối hoặc đã ẩn.");
        }
        return listing;
    }

    private Path resolve(String key) {
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) throw new BadRequestException("Đường dẫn tệp không hợp lệ.");
        return target;
    }

    private void deleteFileIfTransactionRollsBack(Path target) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) deleteQuietly(target);
            }
        });
    }

    private void deleteQuietly(Path target) {
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // The post-commit cleanup service logs deletion failures for retry/operations visibility.
        }
    }

    private record DetectedImage(byte[] bytes, String contentType, String extension) {
    }
}
