package com.ufb.auth.user_management.exception;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Incorrect password");
    }
}
