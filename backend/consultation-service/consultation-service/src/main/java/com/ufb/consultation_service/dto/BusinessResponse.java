package com.ufb.consultation_service.dto;

import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import java.time.Instant;

public record BusinessResponse(
        Long id,
        String ownerEmail,
        String name,
        Sector sector,
        Stage stage,
        String description,
        String needs,
        ConsultationSummary consultation,
        Instant createdAt,
        Instant updatedAt
) {}
