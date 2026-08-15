package com.batdongsan.service;

import com.batdongsan.dto.AuthRes;
import com.batdongsan.dto.LoginReq;
import com.batdongsan.dto.PasswordChangeReq;
import com.batdongsan.dto.RefreshTokenReq;
import com.batdongsan.dto.RegisterReq;
import com.batdongsan.entity.User;
import com.batdongsan.entity.RefreshToken;
import com.batdongsan.entity.UserRole;
import com.batdongsan.entity.UserStatus;
import com.batdongsan.exception.BadRequestException;
import com.batdongsan.repository.UserRepository;
import com.batdongsan.repository.RefreshTokenRepository;
import com.batdongsan.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                authenticationManager,
                jwtUtil,
                userDetailsService,
                604800000L);
    }

    @Test
    void registerNormalizesEmailHashesPasswordAndCreatesUserRole() {
        RegisterReq request = new RegisterReq();
        request.setName("Nguyễn An");
        request.setEmail("  Student@Example.COM ");
        request.setPassword("secret123");

        when(userRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("secret123")).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        AuthRes.UserDto response = authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertEquals("student@example.com", saved.getEmail());
        assertEquals("bcrypt-hash", saved.getPasswordHash());
        assertEquals(UserRole.USER, saved.getRole());
        assertEquals(UserStatus.ACTIVE, saved.getStatus());
        assertEquals("student@example.com", response.getEmail());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterReq request = new RegisterReq();
        request.setEmail("duplicate@example.com");
        when(userRepository.findByEmail("duplicate@example.com"))
                .thenReturn(Optional.of(activeUser("duplicate@example.com")));

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginAuthenticatesActiveUserAndReturnsAccessToken() {
        LoginReq request = new LoginReq();
        request.setEmail("user@example.com");
        request.setPassword("secret123");
        User user = activeUser("user@example.com");
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles("USER")
                .build();

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("access-token");

        AuthRes response = authService.login(request);

        verify(authenticationManager).authenticate(any());
        assertEquals("access-token", response.getAccessToken());
        assertTrue(response.getRefreshToken() != null && !response.getRefreshToken().isBlank());
        assertEquals("user@example.com", response.getUser().getEmail());

        ArgumentCaptor<RefreshToken> tokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(tokenCaptor.capture());
        assertEquals(64, tokenCaptor.getValue().getTokenHash().length());
        assertNotEquals(response.getRefreshToken(), tokenCaptor.getValue().getTokenHash());
    }

    @Test
    void loginRejectsBannedUserBeforeAuthentication() {
        LoginReq request = new LoginReq();
        request.setEmail("banned@example.com");
        request.setPassword("secret123");
        User user = activeUser("banned@example.com");
        user.setStatus(UserStatus.BANNED);
        when(userRepository.findByEmail("banned@example.com")).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> authService.login(request));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    void changePasswordVerifiesCurrentPasswordAndStoresNewHash() {
        User user = activeUser("user@example.com");
        PasswordChangeReq request = new PasswordChangeReq();
        request.setCurrentPassword("old-password");
        request.setNewPassword("new-password");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old-password", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");
        when(refreshTokenRepository.findAllByUserIdAndRevokedAtIsNull(1L))
                .thenReturn(List.of());

        authService.changePassword("user@example.com", request);

        assertEquals("new-hash", user.getPasswordHash());
        verify(userRepository).save(user);
        verify(refreshTokenRepository).saveAll(List.of());
    }

    @Test
    void changePasswordRejectsWrongCurrentPassword() {
        User user = activeUser("user@example.com");
        PasswordChangeReq request = new PasswordChangeReq();
        request.setCurrentPassword("wrong-password");
        request.setNewPassword("new-password");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", user.getPasswordHash())).thenReturn(false);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.changePassword("user@example.com", request));

        assertTrue(exception.getMessage().contains("không đúng"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void refreshRotatesTokenAndRevokesPreviousToken() throws Exception {
        User user = activeUser("user@example.com");
        RefreshToken storedToken = activeRefreshToken(user, "old-refresh-token");
        RefreshTokenReq request = refreshRequest("old-refresh-token");
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles("USER")
                .build();

        when(refreshTokenRepository.findByTokenHash(sha256("old-refresh-token")))
                .thenReturn(Optional.of(storedToken));
        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("new-access-token");

        var response = authService.refresh(request);

        assertEquals("new-access-token", response.getAccessToken());
        assertTrue(response.getRefreshToken() != null && !response.getRefreshToken().isBlank());
        assertTrue(storedToken.getRevokedAt() != null);
        verify(refreshTokenRepository).save(storedToken);
    }

    @Test
    void revokedRefreshTokenCannotBeUsedAgain() throws Exception {
        User user = activeUser("user@example.com");
        RefreshToken storedToken = activeRefreshToken(user, "revoked-token");
        storedToken.setRevokedAt(LocalDateTime.now().minusMinutes(1));
        when(refreshTokenRepository.findByTokenHash(sha256("revoked-token")))
                .thenReturn(Optional.of(storedToken));

        assertThrows(BadRequestException.class,
                () -> authService.refresh(refreshRequest("revoked-token")));
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void logoutRevokesRefreshTokenOwnedByCurrentUser() throws Exception {
        User user = activeUser("user@example.com");
        RefreshToken storedToken = activeRefreshToken(user, "logout-token");
        when(refreshTokenRepository.findByTokenHash(sha256("logout-token")))
                .thenReturn(Optional.of(storedToken));

        authService.logout("user@example.com", refreshRequest("logout-token"));

        assertTrue(storedToken.getRevokedAt() != null);
        verify(refreshTokenRepository).save(storedToken);
    }

    private User activeUser(String email) {
        User user = new User();
        user.setId(1L);
        user.setName("Người dùng");
        user.setEmail(email);
        user.setPasswordHash("old-hash");
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        return user;
    }

    private RefreshToken activeRefreshToken(User user, String rawToken) throws Exception {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(sha256(rawToken));
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        return token;
    }

    private RefreshTokenReq refreshRequest(String rawToken) {
        RefreshTokenReq request = new RefreshTokenReq();
        request.setRefreshToken(rawToken);
        return request;
    }

    private String sha256(String value) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8)));
    }
}
