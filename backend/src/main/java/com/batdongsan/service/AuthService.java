package com.batdongsan.service;

import com.batdongsan.dto.AuthRes;
import com.batdongsan.dto.LoginReq;
import com.batdongsan.dto.PasswordChangeReq;
import com.batdongsan.dto.RegisterReq;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.UserRepository;
import com.batdongsan.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Transactional
    public AuthRes.UserDto register(RegisterReq req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        return new AuthRes.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthRes login(LoginReq req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng"));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(req.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        AuthRes.UserDto userDto = new AuthRes.UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
        return new AuthRes(jwt, userDto);
    }

    @Transactional
    public void changePassword(String email, PasswordChangeReq req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}
