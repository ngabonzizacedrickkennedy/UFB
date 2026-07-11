package com.ufb.consultation_service.exception;

public class BusinessNotFoundException extends RuntimeException {
    public BusinessNotFoundException() {
        super("Business not found");
    }
}
