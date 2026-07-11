package com.ufb.consultation_service.dto;

import com.ufb.consultation_service.model.Sector;
import com.ufb.consultation_service.model.Stage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BusinessCreateRequest(
        @NotBlank @Size(max = 200) String name,
        @NotNull Sector sector,
        @NotNull Stage stage,
        @NotBlank @Size(max = 4000) String description,
        @Size(max = 4000) String needs
) {}
