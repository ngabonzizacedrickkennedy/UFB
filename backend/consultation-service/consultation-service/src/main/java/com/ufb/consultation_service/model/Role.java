package com.ufb.consultation_service.model;

/**
 * Mirrors the "role" claim in JWTs issued by auth-user-management.
 * Defined locally since no shared module exists between services.
 */
public enum Role {
    USER,
    ADMIN
}
