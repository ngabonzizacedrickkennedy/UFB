package com.ufb.consultation_service.dto;

import com.ufb.consultation_service.model.ConsultationStatus;

public record ConsultationSummary(
        Long id,
        ConsultationStatus status
) {}
