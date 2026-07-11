package com.ufb.consultation_service.dto;

import com.ufb.consultation_service.model.ConsultationStatus;
import jakarta.validation.constraints.NotNull;

public record ConsultationStatusUpdateRequest(
        @NotNull ConsultationStatus status
) {}
