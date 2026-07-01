package com.ufb.auth.user_management.security;

import java.time.Instant;

/**
 * Delivers a freshly generated one-time password reset token to the account owner.
 */
public interface PasswordResetNotifier {
    void deliver(String recipientEmail, String rawResetToken, Instant expiresAt);
}
