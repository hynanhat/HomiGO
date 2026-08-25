package com.batdongsan.service;

import com.batdongsan.dto.admin.*;
import com.batdongsan.entity.*;
import com.batdongsan.exception.*;
import com.batdongsan.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {
    private final ListingRepository listings; private final UserRepository users; private final CategoryRepository categories;
    private final RefreshTokenRepository refreshTokens; private final ListingStatusHistoryRepository histories;
    private final NotificationService notificationService;

    public AdminService(ListingRepository listings, UserRepository users, CategoryRepository categories,
                        RefreshTokenRepository refreshTokens, ListingStatusHistoryRepository histories,
                        NotificationService notificationService) {
        this.listings=listings; this.users=users; this.categories=categories;
        this.refreshTokens=refreshTokens; this.histories=histories;
        this.notificationService=notificationService;
    }

    @Transactional(readOnly = true)
    public Page<AdminListingRes> getListings(ListingStatus status, Pageable pageable) {
        return listings.findByStatus(status, pageable).map(AdminListingRes::new);
    }

    @Transactional(readOnly = true)
    public Page<AdminUserRes> getUsers(Pageable pageable) {
        return users.findAll(pageable).map(AdminUserRes::new);
    }

    @Transactional
    public AdminListingRes approveListing(Long listingId, String adminEmail) {
        User admin=admin(adminEmail); Listing listing=listing(listingId); requirePending(listing);
        if(listing.getUser().getStatus()==UserStatus.BANNED)
            throw new BadRequestException("Không thể duyệt tin của tài khoản đang bị khóa.");
        LocalDateTime now=LocalDateTime.now(); listing.setStatus(ListingStatus.ACTIVE); listing.setApprovedBy(admin);
        listing.setApprovedAt(now); listing.setPublishedAt(now); listing.setExpiresAt(now.plusDays(30));
        listing.setRejectionReason(null); listing.setUpdatedAt(now);
        history(listing,ListingStatus.PENDING,ListingStatus.ACTIVE,admin,"Quản trị viên đã duyệt tin");
        Listing saved=listings.saveAndFlush(listing); notificationService.notifyListingApproved(saved);
        return new AdminListingRes(saved);
    }

    @Transactional
    public AdminListingRes rejectListing(Long listingId, String adminEmail, RejectListingReq request) {
        User admin=admin(adminEmail); Listing listing=listing(listingId); requirePending(listing);
        String reason=request.getReason().trim(); listing.setStatus(ListingStatus.REJECTED); listing.setRejectionReason(reason);
        listing.setApprovedBy(null); listing.setApprovedAt(null); listing.setPublishedAt(null); listing.setExpiresAt(null);
        listing.setUpdatedAt(LocalDateTime.now()); history(listing,ListingStatus.PENDING,ListingStatus.REJECTED,admin,reason);
        Listing saved=listings.saveAndFlush(listing); notificationService.notifyListingRejected(saved);
        return new AdminListingRes(saved);
    }

    @Transactional
    public AdminUserRes banUser(Long userId, String adminEmail, BanUserReq request) {
        User admin=admin(adminEmail); User user=users.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy người dùng."));
        if(user.getRole()==UserRole.ADMIN) throw new BadRequestException("Không thể khóa tài khoản quản trị viên.");
        LocalDateTime now=LocalDateTime.now(); user.setStatus(UserStatus.BANNED); users.save(user);

        List<RefreshToken> tokens=refreshTokens.findAllByUserIdAndRevokedAtIsNull(userId);
        tokens.forEach(token->token.setRevokedAt(now)); refreshTokens.saveAll(tokens);

        List<Listing> active=listings.findByUserIdAndStatus(userId,ListingStatus.ACTIVE);
        String reason="Khóa tài khoản: "+request.getReason().trim();
        active.forEach(listing->{listing.setStatus(ListingStatus.INACTIVE);listing.setUpdatedAt(now);
            history(listing,ListingStatus.ACTIVE,ListingStatus.INACTIVE,admin,reason);});
        listings.saveAll(active);
        return new AdminUserRes(user);
    }

    @Transactional
    public AdminUserRes unbanUser(Long userId) {
        User user=users.findById(userId).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy người dùng."));
        user.setStatus(UserStatus.ACTIVE); return new AdminUserRes(users.save(user));
    }

    @Transactional(readOnly=true) public Page<CategoryRes> getCategories(Pageable pageable){return categories.findAll(pageable).map(CategoryRes::new);}
    @Transactional public CategoryRes createCategory(CategoryReq request){
        if(categories.existsBySlug(request.getSlug()))throw new ConflictException("Slug danh mục đã tồn tại.");
        Category category=new Category();applyCategory(category,request);return new CategoryRes(categories.save(category));}
    @Transactional public CategoryRes updateCategory(Long id,CategoryReq request){Category category=categories.findById(id)
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy danh mục."));
        if(categories.existsBySlugAndIdNot(request.getSlug(),id))throw new ConflictException("Slug danh mục đã tồn tại.");
        applyCategory(category,request);return new CategoryRes(categories.save(category));}
    @Transactional public void deleteCategory(Long id){Category category=categories.findById(id)
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy danh mục."));categories.delete(category);categories.flush();}

    private void applyCategory(Category category,CategoryReq request){category.setName(request.getName().trim());
        category.setSlug(request.getSlug().trim());category.setTransactionType(request.getTransactionType());}

    private Listing listing(Long id){return listings.findById(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng."));}
    private User admin(String email){User user=users.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy quản trị viên."));
        if(user.getRole()!=UserRole.ADMIN||user.getStatus()!=UserStatus.ACTIVE)throw new ForbiddenException("Tài khoản không có quyền kiểm duyệt.");return user;}
    private void requirePending(Listing listing){if(listing.getStatus()!=ListingStatus.PENDING)
        throw new BadRequestException("Chỉ có thể duyệt hoặc từ chối tin đang chờ duyệt.");}
    private void history(Listing listing,ListingStatus from,ListingStatus to,User actor,String reason){ListingStatusHistory h=new ListingStatusHistory();
        h.setListing(listing);h.setFromStatus(from);h.setToStatus(to);h.setChangedBy(actor);h.setReason(reason);histories.save(h);}
}
