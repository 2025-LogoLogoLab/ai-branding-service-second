package com.example.logologolab.dto.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.dto.tag.TagResponse;

import java.time.OffsetDateTime;

import java.util.List;
import java.util.stream.Collectors;

public record LogoResponse(
        Long id,
        String prompt,
        String imageUrl,
        String createdBy,
        OffsetDateTime createdAt,
        List<TagResponse> tags
) {
    public static LogoResponse from(Logo logo) {

        List<TagResponse> tagResponses = logo.getTags().stream()
                .map(TagResponse::from) // tag -> new TagResponse(tag.getId(), tag.getName())
                .collect(Collectors.toList());

        return new LogoResponse(
                logo.getId(),
                logo.getPrompt(),
                logo.getImageUrl(),
                logo.getCreatedBy().getEmail(),
                logo.getCreatedAt(),
                tagResponses
        );
    }
}