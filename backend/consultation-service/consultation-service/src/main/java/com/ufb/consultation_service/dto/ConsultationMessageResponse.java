package com.ufb.consultation_service.dto;

import com.ufb.consultation_service.model.Role;
import java.time.Instant;

public record ConsultationMessageResponse(
        Long id,
        String authorEmail,
        Role authorRole,
        String body,
        Instant createdAt
) {}
