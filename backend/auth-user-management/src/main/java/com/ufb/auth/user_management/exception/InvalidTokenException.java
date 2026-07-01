package com.ufb.auth.user_management.exception;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException() {
        super("Invalid or expired refresh token");
    }
}
