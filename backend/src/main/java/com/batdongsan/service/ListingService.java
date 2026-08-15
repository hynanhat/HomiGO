package com.batdongsan.service;

import com.batdongsan.dto.*;
import com.batdongsan.entity.*;
import com.batdongsan.exception.*;
import com.batdongsan.repository.*;
import com.batdongsan.repository.specification.ListingSpecifications;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ListingService {
    private final ListingRepository listings;
    private final CategoryRepository categories;
    private final DistrictRepository districts;
    private final WardRepository wards;
    private final ProjectRepository projects;
    private final UserRepository users;
    private final SavedListingRepository savedListings;
    private final ListingStatusHistoryRepository histories;

    public ListingService(ListingRepository listings, CategoryRepository categories, DistrictRepository districts,
                          WardRepository wards, ProjectRepository projects, UserRepository users,
                          SavedListingRepository savedListings, ListingStatusHistoryRepository histories) {
        this.listings= listings; this.categories=categories; this.districts=districts; this.wards=wards;
        this.projects=projects; this.users=users; this.savedListings=savedListings; this.histories=histories;
    }

    @Transactional
    public ListingRes createListing(String email, ListingReq request) {
        User owner=user(email); Listing listing=new Listing(); listing.setUser(owner);
        listing.setPublicCode("HMG-"+UUID.randomUUID().toString().replace("-","").substring(0,12).toUpperCase());
        apply(listing,request); listing.setStatus(ListingStatus.DRAFT); listing=listings.save(listing);
        record(listing,null,ListingStatus.DRAFT,owner,"Tạo bản nháp"); return new ListingRes(listing);
    }

    @Transactional
    public ListingRes updateListing(Long id,String email,ListingReq request) {
        Listing listing=owned(id,email);
        if(request.getVersion()==null||!Objects.equals(request.getVersion(),listing.getVersion()))
            throw new ConflictException("Tin đăng đã được thay đổi. Vui lòng tải lại trước khi cập nhật.");
        if(listing.getStatus()==ListingStatus.PENDING||listing.getStatus()==ListingStatus.EXPIRED)
            throw new BadRequestException("Không thể sửa tin ở trạng thái hiện tại.");
        ListingStatus before=listing.getStatus(); apply(listing,request); listing.setUpdatedAt(LocalDateTime.now());
        if(before==ListingStatus.ACTIVE){listing.setStatus(ListingStatus.PENDING);listing.setRejectionReason(null);
            record(listing,before,ListingStatus.PENDING,listing.getUser(),"Nội dung được chỉnh sửa và cần duyệt lại");}
        else if(before==ListingStatus.REJECTED){listing.setStatus(ListingStatus.DRAFT);
            record(listing,before,ListingStatus.DRAFT,listing.getUser(),"Chỉnh sửa tin bị từ chối");}
        return new ListingRes(listings.saveAndFlush(listing));
    }

    @Transactional public void deleteListing(Long id,String email){listings.delete(owned(id,email));}

    @Transactional
    public ListingRes submitListing(Long id,String email){Listing listing=owned(id,email);
        if(!EnumSet.of(ListingStatus.DRAFT,ListingStatus.REJECTED,ListingStatus.INACTIVE).contains(listing.getStatus()))
            throw new BadRequestException("Chỉ có thể gửi duyệt tin nháp, bị từ chối hoặc đã ẩn.");
        transition(listing,ListingStatus.PENDING,listing.getUser(),"Người bán gửi duyệt");listing.setRejectionReason(null);
        return new ListingRes(listings.saveAndFlush(listing));}

    @Transactional
    public ListingRes deactivateListing(Long id,String email){Listing listing=owned(id,email);
        if(listing.getStatus()!=ListingStatus.ACTIVE)throw new BadRequestException("Chỉ tin đang hoạt động mới có thể ẩn.");
        transition(listing,ListingStatus.INACTIVE,listing.getUser(),"Người bán chủ động ẩn tin");
        return new ListingRes(listings.saveAndFlush(listing));}

    @Transactional(readOnly=true) public ListingRes getOwnedListing(Long id,String email){return new ListingRes(owned(id,email));}
    @Transactional(readOnly=true) public Page<ListingRes> getMyListings(String email,Pageable pageable){
        return listings.findByUserId(user(email).getId(),pageable).map(ListingRes::new);}

    @Transactional
    public int expireDueListings(LocalDateTime now){List<Listing> due=listings.findByStatusAndExpiresAtBefore(ListingStatus.ACTIVE,now);
        due.forEach(listing->transition(listing,ListingStatus.EXPIRED,listing.getUser(),"Hệ thống tự động hết hạn sau 30 ngày"));
        listings.saveAll(due);return due.size();}

    @Transactional(readOnly=true)
    public Page<ListingRes> searchListings(ListingFilter filter,Pageable pageable){
        Pageable sorted=PageRequest.of(pageable.getPageNumber(),pageable.getPageSize(),filter.toSort());
        return listings.findAll(ListingSpecifications.from(filter,LocalDateTime.now()),sorted).map(ListingRes::new);
    }

    @Transactional(readOnly=true)
    public ListingRes getListingByPublicCode(String publicCode){return new ListingRes(listings
            .findByPublicCodeAndStatus(publicCode,ListingStatus.ACTIVE)
            .filter(listing->listing.getExpiresAt()==null||listing.getExpiresAt().isAfter(LocalDateTime.now()))
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng.")));}

    @Transactional(readOnly=true)
    public ListingRes getListingById(Long id){return new ListingRes(listings.findByIdAndStatus(id,ListingStatus.ACTIVE)
            .filter(listing->listing.getExpiresAt()==null||listing.getExpiresAt().isAfter(LocalDateTime.now()))
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng.")));}

    @Transactional public void saveListing(Long id,String email){User user=user(email);Listing listing=listings.findByIdAndStatus(id,ListingStatus.ACTIVE)
            .filter(candidate->candidate.getExpiresAt()==null||candidate.getExpiresAt().isAfter(LocalDateTime.now()))
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng."));
        if(!savedListings.existsByUserIdAndListingId(user.getId(),id)){SavedListing saved=new SavedListing();saved.setUser(user);
            saved.setListing(listing);savedListings.save(saved);}}
    @Transactional public void unsaveListing(Long id,String email){User user=user(email);savedListings.deleteByUserIdAndListingId(user.getId(),id);}
    @Transactional(readOnly=true) public Page<ListingRes> getSavedListings(String email,Pageable pageable){return savedListings
            .findByUserId(user(email).getId(),pageable).map(saved->new ListingRes(saved.getListing()));}

    private void apply(Listing listing,ListingReq request){Category category=categories.findById(request.getCategoryId())
            .orElseThrow(()->new ResourceNotFoundException("Không tìm thấy danh mục."));
        District district=districts.findById(request.getDistrictId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy quận/huyện."));
        Ward ward=request.getWardId()==null?null:wards.findById(request.getWardId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy phường/xã."));
        if(ward!=null&&!Objects.equals(ward.getDistrict().getId(),district.getId()))throw new BadRequestException("Phường/xã không thuộc quận/huyện đã chọn.");
        Project project=request.getProjectId()==null?null:projects.findById(request.getProjectId()).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy dự án."));
        listing.setCategory(category);listing.setDistrict(district);listing.setWard(ward);listing.setProject(project);
        listing.setTitle(request.getTitle().trim());listing.setDescription(request.getDescription().trim());listing.setPrice(request.getPrice());
        listing.setArea(request.getArea());listing.setAddress(request.getAddress().trim());listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());listing.setBedrooms(request.getBedrooms());listing.setBathrooms(request.getBathrooms());
        listing.setFloors(request.getFloors());listing.setDirection(request.getDirection());listing.setFurnishing(request.getFurnishing());
        listing.setLegalStatus(request.getLegalStatus());listing.setContactName(request.getContactName().trim());listing.setContactPhone(request.getContactPhone().trim());}
    private User user(String email){return users.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy người dùng."));}
    private Listing owned(Long id,String email){Listing listing=listings.findById(id).orElseThrow(()->new ResourceNotFoundException("Không tìm thấy tin đăng."));
        if(!listing.getUser().getEmail().equalsIgnoreCase(email))throw new ForbiddenException("Bạn không có quyền thao tác trên tin đăng này.");return listing;}
    private void transition(Listing listing,ListingStatus to,User actor,String reason){ListingStatus from=listing.getStatus();listing.setStatus(to);
        listing.setUpdatedAt(LocalDateTime.now());record(listing,from,to,actor,reason);}
    private void record(Listing listing,ListingStatus from,ListingStatus to,User actor,String reason){ListingStatusHistory history=new ListingStatusHistory();
        history.setListing(listing);history.setFromStatus(from);history.setToStatus(to);history.setChangedBy(actor);history.setReason(reason);histories.save(history);}
}
