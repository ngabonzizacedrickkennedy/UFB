package com.ufb.consultation_service.exception;

public class IllegalConsultationTransitionException extends RuntimeException {
    public IllegalConsultationTransitionException(String message) {
        super(message);
    }
}
