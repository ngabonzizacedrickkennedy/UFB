package com.ufb.auth.user_management.service.impl;

import com.ufb.auth.user_management.dto.AuthResponse;
import com.ufb.auth.user_management.dto.LoginRequest;
import com.ufb.auth.user_management.dto.RegisterRequest;
import com.ufb.auth.user_management.dto.UserResponse;
import com.ufb.auth.user_management.exception.EmailAlreadyExistsException;
import com.ufb.auth.user_management.exception.InvalidCredentialsException;
import com.ufb.auth.user_management.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import com.ufb.auth.user_management.model.Role;
import com.ufb.auth.user_management.model.User;
import com.ufb.auth.user_management.repository.UserRepository;
import com.ufb.auth.user_management.security.JwtService;
import com.ufb.auth.user_management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        User user = User.builder()
                .email(request.email())
                .fullName(request.fullName())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .enabled(true)
                .passwordSet(true)
                .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);
        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                toResponse(user)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        final Claims claims;
        try {
            claims = jwtService.parse(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new InvalidTokenException();
        }

        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new InvalidTokenException();
        }

        String email = claims.getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidTokenException::new);

        if (!user.isEnabled()) {
            throw new InvalidTokenException();
        }

        return new AuthResponse(
                jwtService.generateAccessToken(user),
                jwtService.generateRefreshToken(user),
                toResponse(user)
        );
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(),
                u.getRole(), u.isEnabled(), u.getCreatedAt());
    }
}
