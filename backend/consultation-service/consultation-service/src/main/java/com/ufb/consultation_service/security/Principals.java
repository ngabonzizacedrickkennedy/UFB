package com.ufb.consultation_service.security;

import com.ufb.consultation_service.model.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public final class Principals {

    private Principals() {}

    public static Role roleOf(Authentication authentication) {
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))
                ? Role.ADMIN
                : Role.USER;
    }
}
