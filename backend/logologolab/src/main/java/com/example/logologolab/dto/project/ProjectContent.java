package com.example.logologolab.dto.project;

import java.time.OffsetDateTime;

public record ProjectContent(
        Long id,
        String type,
        OffsetDateTime createdAt
) {}