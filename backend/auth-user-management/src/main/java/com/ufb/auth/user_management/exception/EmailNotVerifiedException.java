package com.ufb.auth.user_management.exception;

public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException() {
        super("Please verify your email before signing in");
    }
}
