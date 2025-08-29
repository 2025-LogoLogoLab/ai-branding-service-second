package com.example.logologolab.dto.brand;

import com.example.logologolab.domain.Style;
import java.time.OffsetDateTime;

public record BrandStrategyListItem(
        Long id, String briefKo, Style style, OffsetDateTime createdAt
) {}