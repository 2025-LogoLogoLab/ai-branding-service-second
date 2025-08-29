package com.example.logologolab.dto.color;

import com.example.logologolab.domain.Style;
import java.time.OffsetDateTime;

public record ColorGuideListItem(
        Long id, String briefKo, Style style, String mainHex, String pointHex, OffsetDateTime createdAt
) {}