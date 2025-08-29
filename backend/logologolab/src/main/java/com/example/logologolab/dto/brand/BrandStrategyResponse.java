package com.example.logologolab.dto.brand;

import com.example.logologolab.domain.*;
import java.time.OffsetDateTime;

public record BrandStrategyResponse(
        Long id,
        String briefKo,
        Style style,
        CaseType caseType,
        String sourceImage,
        Long projectId,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String markdown
) {}