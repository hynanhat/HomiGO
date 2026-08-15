package com.batdongsan.service;

import com.batdongsan.entity.*;
import com.batdongsan.exception.*;
import com.batdongsan.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageService {
    private static final long MAX_SIZE=5L*1024*1024;
    private static final Map<String,String> TYPES=Map.of("image/jpeg",".jpg","image/png",".png","image/webp",".webp");
    private final Path root; private final ListingRepository listings; private final ListingImageRepository images;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String dir,ListingRepository listings,ListingImageRepository images){
        this.root=Paths.get(dir).toAbsolutePath().normalize();this.listings=listings;this.images=images;
        try{Files.createDirectories(root);}catch(IOException e){throw new IllegalStateException("Không thể tạo thư mục lưu ảnh.",e);}
    }

    @Transactional
    public ListingImage addImage(Long listingId,String email,MultipartFile file){
        validateFile(file); Listing listing=owned(listingId,email);
        long count=images.countByListingId(listingId);if(count>=10)throw new BadRequestException("Mỗi tin đăng chỉ được có tối đa 10 ảnh.");
        String key=UUID.randomUUID()+TYPES.get(file.getContentType()); Path target=resolve(key);
        try{Files.copy(file.getInputStream(),target,StandardCopyOption.REPLACE_EXISTING);}catch(IOException e){throw new IllegalStateException("Không thể lưu ảnh.",e);}
        try{ListingImage image=new ListingImage();image.setListing(listing);image.setStorageKey(key);image.setUrl("/uploads/"+key);
            image.setContentType(file.getContentType());image.setSizeBytes(file.getSize());image.setSortOrder((int)count);return images.save(image);
        }catch(RuntimeException e){try{Files.deleteIfExists(target);}catch(IOException ignored){}throw e;}
    }

    @Transactional
    public void deleteImage(Long listingId,Long imageId,String email){owned(listingId,email);ListingImage image=images.findByIdAndListingId(imageId,listingId)
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy ảnh."));images.delete(image);
        try{Files.deleteIfExists(resolve(image.getStorageKey()));}catch(IOException e){throw new IllegalStateException("Không thể xóa ảnh.",e);}}

    private void validateFile(MultipartFile file){if(file==null||file.isEmpty())throw new BadRequestException("Tệp ảnh không được để trống.");
        if(file.getSize()>MAX_SIZE)throw new BadRequestException("Ảnh không được vượt quá 5 MB.");
        if(!TYPES.containsKey(file.getContentType()))throw new BadRequestException("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
        String original=file.getOriginalFilename();if(original!=null&&(original.contains("..")||original.contains("/")||original.contains("\\")))
            throw new BadRequestException("Tên tệp không hợp lệ.");}
    private Listing owned(Long id,String email){Listing l=listings.findById(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng."));
        if(!l.getUser().getEmail().equalsIgnoreCase(email))throw new ForbiddenException("Bạn không có quyền thay đổi ảnh của tin này.");return l;}
    private Path resolve(String key){Path target=root.resolve(key).normalize();if(!target.startsWith(root))throw new BadRequestException("Đường dẫn tệp không hợp lệ.");return target;}
}
