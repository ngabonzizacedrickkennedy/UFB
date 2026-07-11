package com.ufb.consultation_service.event;

import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import java.time.Instant;

public record BusinessStageChangedEvent(
        String eventType,
        Long businessId,
        String ownerEmail,
        Sector sector,
        Stage oldStage,
        Stage newStage,
        Instant occurredAt
) {}
