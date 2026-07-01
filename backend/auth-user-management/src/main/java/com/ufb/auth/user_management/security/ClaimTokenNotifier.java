package com.ufb.auth.user_management.security;

/**
 * Delivers a freshly generated one-time claim token to the account owner.
 */
public interface ClaimTokenNotifier {
    void deliver(String recipientEmail, String rawClaimToken, java.time.Instant expiresAt);
}
