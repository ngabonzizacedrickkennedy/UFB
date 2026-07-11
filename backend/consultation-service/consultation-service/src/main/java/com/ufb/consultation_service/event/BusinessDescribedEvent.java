package com.ufb.consultation_service.event;

import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import java.time.Instant;

/**
 * Published when a user submits or updates a business. Carries sector and stage
 * so downstream services can target audiences (e.g. "every startup").
 */
public record BusinessDescribedEvent(
        String eventType,
        Long businessId,
        String ownerEmail,
        String name,
        Sector sector,
        Stage stage,
        Instant occurredAt
) {}
