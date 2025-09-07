package com.example.logologolab.dto.logo;

import com.example.logologolab.domain.Logo;
import java.time.OffsetDateTime;

public record LogoResponse(
        Long id,
        String prompt,
        String imageUrl,
        String createdBy,
        OffsetDateTime createdAt
) {
    public static LogoResponse from(Logo logo) {
        return new LogoResponse(
                logo.getId(),
                logo.getPrompt(),
                logo.getImageUrl(),
                logo.getCreatedBy().getEmail(),
                logo.getCreatedAt()
        );
    }
}