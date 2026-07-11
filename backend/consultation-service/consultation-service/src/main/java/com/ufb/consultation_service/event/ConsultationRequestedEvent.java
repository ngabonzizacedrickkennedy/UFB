package com.ufb.consultation_service.event;

import java.time.Instant;

public record ConsultationRequestedEvent(
        String eventType,
        Long consultationId,
        Long businessId,
        String ownerEmail,
        Instant occurredAt
) {}
