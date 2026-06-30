package com.ufb.auth.user_management.dto;

import com.ufb.auth.user_management.model.Role;
import java.time.Instant;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean enabled,
        Instant createdAt
) {}
