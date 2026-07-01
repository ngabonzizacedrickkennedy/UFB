package com.ufb.auth.user_management.exception;

public class EmailUndeliverableException extends RuntimeException {
    public EmailUndeliverableException() {
        super("We couldn't deliver a message to this email address");
    }
}
