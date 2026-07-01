package com.ufb.auth.user_management.exception;

public class InvalidResetException extends RuntimeException {
    public InvalidResetException() {
        super("Invalid, expired, or already-used reset token");
    }
}
