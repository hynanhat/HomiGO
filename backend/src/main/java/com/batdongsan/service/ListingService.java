package com.batdongsan.service;

import com.batdongsan.dto.ListingFilter;
import com.batdongsan.dto.ListingReq;
import com.batdongsan.dto.ListingRes;
import com.batdongsan.entity.*;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SavedListingRepository savedListingRepository;

    @Transactional
    public ListingRes createListing(String email, ListingReq req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        District district = districtRepository.findById(req.getDistrictId())
                .orElseThrow(() -> new ResourceNotFoundException("District not found"));

        Project project = null;
        if (req.getProjectId() != null) {
            project = projectRepository.findById(req.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        }

        Listing listing = new Listing();
        listing.setUser(user);
        listing.setCategory(category);
        listing.setDistrict(district);
        listing.setProject(project);
        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        listing.setPrice(req.getPrice());
        listing.setArea(req.getArea());
        listing.setStatus(ListingStatus.PENDING); // Admin duyệt

        listing = listingRepository.save(listing);
        return new ListingRes(listing);
    }

    @Transactional
    public ListingRes updateListing(Long id, String email, ListingReq req) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Bạn không có quyền sửa tin này");
        }

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        District district = districtRepository.findById(req.getDistrictId())
                .orElseThrow(() -> new ResourceNotFoundException("District not found"));

        Project project = null;
        if (req.getProjectId() != null) {
            project = projectRepository.findById(req.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        }

        listing.setCategory(category);
        listing.setDistrict(district);
        listing.setProject(project);
        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        listing.setPrice(req.getPrice());
        listing.setArea(req.getArea());

        listing = listingRepository.save(listing);
        return new ListingRes(listing);
    }

    @Transactional
    public void deleteListing(Long id, String email) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getUser().getEmail().equals(email)) {
            throw new BadRequestException("Bạn không có quyền xóa tin này");
        }

        listingRepository.delete(listing);
    }

    public Page<ListingRes> searchListings(ListingFilter filter, Pageable pageable) {
        Specification<Listing> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only active listings
            predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

            if (filter.getTransactionType() != null && !filter.getTransactionType().isEmpty()) {
                predicates.add(cb.equal(root.join("category").get("transactionType"), TransactionType.valueOf(filter.getTransactionType().toUpperCase())));
            }
            if (filter.getProvinceId() != null) {
                predicates.add(cb.equal(root.join("district").join("province").get("id"), filter.getProvinceId()));
            }
            if (filter.getDistrictId() != null) {
                predicates.add(cb.equal(root.join("district").get("id"), filter.getDistrictId()));
            }
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.join("category").get("id"), filter.getCategoryId()));
            }
            if (filter.getProjectId() != null) {
                predicates.add(cb.equal(root.join("project").get("id"), filter.getProjectId()));
            }
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }
            if (filter.getMinArea() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("area"), filter.getMinArea()));
            }
            if (filter.getMaxArea() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("area"), filter.getMaxArea()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return listingRepository.findAll(spec, pageable).map(ListingRes::new);
    }

    public ListingRes getListingById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        return new ListingRes(listing);
    }

    @Transactional
    public void saveListing(Long listingId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        boolean alreadySaved = savedListingRepository.findByUserId(user.getId()).stream()
                .anyMatch(sl -> sl.getListing().getId().equals(listingId));

        if (!alreadySaved) {
            SavedListing savedListing = new SavedListing();
            savedListing.setUser(user);
            savedListing.setListing(listing);
            savedListingRepository.save(savedListing);
        }
    }

    @Transactional
    public void unsaveListing(Long listingId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        savedListingRepository.deleteByUserIdAndListingId(user.getId(), listingId);
    }

    public List<ListingRes> getSavedListings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return savedListingRepository.findByUserId(user.getId()).stream()
                .map(sl -> new ListingRes(sl.getListing()))
                .collect(java.util.stream.Collectors.toList());
    }
}
