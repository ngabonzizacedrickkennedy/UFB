package com.ufb.auth.user_management.exception;

public class InvalidVerificationException extends RuntimeException {
    public InvalidVerificationException() {
        super("Invalid, expired, or already-used verification token");
    }
}
