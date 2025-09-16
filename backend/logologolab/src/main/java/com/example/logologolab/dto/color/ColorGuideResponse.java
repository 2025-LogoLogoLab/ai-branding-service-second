package com.example.logologolab.dto.color;

import com.example.logologolab.domain.*;
import java.time.OffsetDateTime;

public record ColorGuideResponse(
        Long id,
        String briefKo,
        Style style,
        CaseType caseType,
        String sourceImage,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        ColorGuideDTO guide
) {}
