package com.ufb.auth.user_management.security;

import java.time.Instant;

/**
 * Delivers a freshly generated one-time email-verification token to the account owner.
 */
public interface AccountVerificationNotifier {
    void deliver(String recipientEmail, String rawVerificationToken, Instant expiresAt);
}
