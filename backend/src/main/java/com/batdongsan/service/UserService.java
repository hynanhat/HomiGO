package com.batdongsan.service;

import com.batdongsan.dto.UserProfileReq;
import com.batdongsan.dto.UserProfileRes;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileRes getProfile(String email) {
        return new UserProfileRes(findActiveUser(email));
    }

    @Transactional
    public UserProfileRes updateProfile(String email, UserProfileReq req) {
        User user = findActiveUser(email);
        user.setName(req.getName().trim());
        user.setPhone(req.getPhone() == null || req.getPhone().isBlank()
                ? null
                : req.getPhone().trim());
        return new UserProfileRes(userRepository.save(user));
    }

    private User findActiveUser(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));
        if (user.getStatus() == UserStatus.BANNED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }
        return user;
    }
}
