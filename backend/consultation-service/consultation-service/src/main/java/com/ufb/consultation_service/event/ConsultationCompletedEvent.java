package com.ufb.consultation_service.event;

import java.time.Instant;

public record ConsultationCompletedEvent(
        String eventType,
        Long consultationId,
        Long businessId,
        String ownerEmail,
        String adminEmail,
        Instant occurredAt
) {}
