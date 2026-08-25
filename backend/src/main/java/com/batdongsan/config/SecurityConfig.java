package com.batdongsan.config;

import com.batdongsan.security.JwtAuthFilter;
import com.batdongsan.security.RateLimitFilter;
import com.batdongsan.exception.ErrorCode;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RateLimitFilter rateLimitFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rateLimitFilter = rateLimitFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) ->
                    writeSecurityError(response, ErrorCode.UNAUTHORIZED))
                .accessDeniedHandler((request, response, exception) ->
                    writeSecurityError(response, ErrorCode.ACCESS_DENIED)))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/logout").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/v1/users/me", "/api/v1/auth/password").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/payments/sepay/ipn").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/payments/sepay/seller-upgrade").hasRole("USER")
                .requestMatchers("/api/v1/payments/**").authenticated()
                .requestMatchers("/api/v1/saved-listings/**").authenticated()
                .requestMatchers("/api/v1/notifications/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/v1/listings/*/views").permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/v1/listings/**", "/api/v1/projects/**", "/api/v1/categories").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/locations/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/seller/**").hasRole("SELLER")
                .requestMatchers(HttpMethod.POST, "/api/v1/listings", "/api/v1/listings/upload")
                    .hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/listings/**").hasAnyRole("SELLER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/listings/**").hasAnyRole("SELLER", "ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private static void writeSecurityError(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(("""
                {"success":false,"data":null,"message":"%s","errorCode":"%s"}
                """).formatted(errorCode.getDefaultMessage(), errorCode.getCode()).trim());
    }
}
