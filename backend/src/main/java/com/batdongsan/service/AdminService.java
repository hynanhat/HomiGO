package com.batdongsan.service;

import com.batdongsan.entity.*;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.CategoryRepository;
import com.batdongsan.repository.ListingRepository;
import com.batdongsan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional
    public void approveListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
    }

    @Transactional
    public void rejectListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        listing.setStatus(ListingStatus.REJECTED);
        listingRepository.save(listing);
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);

        // Auto-reject active listings of banned user
        List<Listing> userListings = listingRepository.findAll().stream()
                .filter(l -> l.getUser().getId().equals(userId) && l.getStatus() == ListingStatus.ACTIVE)
                .toList();

        for (Listing listing : userListings) {
            listing.setStatus(ListingStatus.INACTIVE);
            listingRepository.save(listing);
        }
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(req.getName());
        category.setSlug(req.getSlug());
        category.setTransactionType(req.getTransactionType());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }
}
