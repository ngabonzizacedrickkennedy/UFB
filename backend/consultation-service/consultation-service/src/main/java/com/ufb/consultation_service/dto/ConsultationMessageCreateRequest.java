package com.ufb.consultation_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConsultationMessageCreateRequest(
        @NotBlank @Size(max = 4000) String body
) {}
