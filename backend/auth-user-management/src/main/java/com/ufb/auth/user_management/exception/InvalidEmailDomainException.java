package com.ufb.auth.user_management.exception;

public class InvalidEmailDomainException extends RuntimeException {
    public InvalidEmailDomainException() {
        super("This email address does not appear to exist");
    }
}
