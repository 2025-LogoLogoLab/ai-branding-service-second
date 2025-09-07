package com.example.logologolab.dto.logo;

import java.time.OffsetDateTime;

public record LogoListItem(
        Long id,
        String prompt,
        String imageUrl,
        OffsetDateTime createdAt
) {}