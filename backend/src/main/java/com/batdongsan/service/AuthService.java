package com.batdongsan.service;

import com.batdongsan.dto.AuthRes;
import com.batdongsan.dto.LoginReq;
import com.batdongsan.dto.PasswordChangeReq;
import com.batdongsan.dto.RefreshTokenReq;
import com.batdongsan.dto.RegisterReq;
import com.batdongsan.dto.TokenRefreshRes;
import com.batdongsan.entity.RefreshToken;
import com.batdongsan.entity.User;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.exception.ResourceNotFoundException;
import com.batdongsan.repository.RefreshTokenRepository;
import com.batdongsan.repository.UserRepository;
import com.batdongsan.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final long refreshExpiration;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpiration) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.refreshExpiration = refreshExpiration;
    }

    @Transactional
    public AuthRes.UserDto register(RegisterReq req) {
        String email = normalizeEmail(req.getEmail());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email đã được sử dụng.");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhone(normalizeOptional(req.getPhone()));
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);
        return toUserDto(user);
    }

    @Transactional
    public AuthRes login(LoginReq req) {
        String email = normalizeEmail(req.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng."));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, req.getPassword()));
        } catch (AuthenticationException ex) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng.");
        }

        TokenPair tokens = issueTokenPair(user);
        return new AuthRes(tokens.accessToken(), tokens.refreshToken(), toUserDto(user));
    }

    @Transactional
    public TokenRefreshRes refresh(RefreshTokenReq req) {
        LocalDateTime now = LocalDateTime.now();
        RefreshToken currentToken = refreshTokenRepository.findByTokenHash(hashToken(req.getRefreshToken()))
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ."));

        if (!currentToken.isActive(now)) {
            throw new BadRequestException("Refresh token đã hết hạn hoặc đã bị thu hồi.");
        }

        User user = currentToken.getUser();
        if (user.getStatus() == UserStatus.BANNED) {
            throw new BadRequestException("Tài khoản của bạn đã bị khóa.");
        }

        currentToken.setRevokedAt(now);
        refreshTokenRepository.save(currentToken);

        TokenPair tokens = issueTokenPair(user);
        return new TokenRefreshRes(tokens.accessToken(), tokens.refreshToken());
    }

    @Transactional
    public void logout(String email, RefreshTokenReq req) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashToken(req.getRefreshToken()))
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ."));

        if (!token.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new BadRequestException("Refresh token không thuộc phiên đăng nhập hiện tại.");
        }

        if (token.getRevokedAt() == null) {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        }
    }

    @Transactional
    public void changePassword(String email, PasswordChangeReq req) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng."));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng.");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        revokeActiveSessions(user.getId());
    }

    private TokenPair issueTokenPair(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String rawRefreshToken = generateRefreshToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawRefreshToken));
        refreshToken.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpiration)));
        refreshTokenRepository.save(refreshToken);

        return new TokenPair(accessToken, rawRefreshToken);
    }

    private void revokeActiveSessions(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        var activeTokens = refreshTokenRepository.findAllByUserIdAndRevokedAtIsNull(userId);
        activeTokens.forEach(token -> token.setRevokedAt(now));
        refreshTokenRepository.saveAll(activeTokens);
    }

    private String generateRefreshToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Không thể khởi tạo bộ băm token.", ex);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AuthRes.UserDto toUserDto(User user) {
        return new AuthRes.UserDto(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    private record TokenPair(String accessToken, String refreshToken) {
    }
}
