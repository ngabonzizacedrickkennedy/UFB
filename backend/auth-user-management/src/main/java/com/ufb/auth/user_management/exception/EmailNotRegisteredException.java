package com.ufb.auth.user_management.exception;

public class EmailNotRegisteredException extends RuntimeException {
    public EmailNotRegisteredException() {
        super("No account exists with this email");
    }
}
