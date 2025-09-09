package com.example.logologolab.dto.brand;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.tag.TagResponse;

import java.time.OffsetDateTime;

import java.util.List;
import java.util.stream.Collectors;

public record BrandStrategyResponse(
        Long id,
        String briefKo,
        Style style,
        CaseType caseType,
        String sourceImage,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String markdown,
        List<TagResponse> tags
) {
    public static BrandStrategyResponse from(BrandStrategy e) {
        // Tag 변환
        List<TagResponse> tagResponses = e.getTags().stream()
                .map(TagResponse::from)
                .collect(Collectors.toList());

        return new BrandStrategyResponse(
                e.getId(),
                e.getBriefKo(),
                e.getStyle(),
                e.getCaseType(),
                e.getSourceImage(),
                e.getCreatedBy().getEmail(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                e.getMarkdown(),
                tagResponses
        );
    }
}