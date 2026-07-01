package com.ufb.auth.user_management.security;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Generates cryptographically random, URL-safe one-time tokens
 * (used for account claim and password reset links).
 */
public final class OneTimeTokens {

    private static final SecureRandom RANDOM = new SecureRandom();

    private OneTimeTokens() {}

    public static String generate() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
