package com.ufb.consultation_service.exception;

public class ConsultationNotFoundException extends RuntimeException {
    public ConsultationNotFoundException() {
        super("Consultation not found");
    }
}
