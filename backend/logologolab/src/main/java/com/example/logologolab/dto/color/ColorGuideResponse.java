package com.example.logologolab.dto.color;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.tag.TagResponse;

import java.time.OffsetDateTime;

import java.util.List;
import java.util.stream.Collectors;

public record ColorGuideResponse(
        Long id,
        String briefKo,
        Style style,
        CaseType caseType,
        String sourceImage,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        ColorGuideDTO guide,
        List<TagResponse> tags
) {
    public static ColorGuideResponse from(ColorGuide e) {
        // Tag 변환
        List<TagResponse> tagResponses = e.getTags().stream()
                .map(TagResponse::from)
                .collect(Collectors.toList());

        // ColorGuideDTO 변환
        ColorGuideDTO guideDto = new ColorGuideDTO(
                new ColorGuideDTO.Role(e.getMainHex(), e.getMainDesc()),
                new ColorGuideDTO.Role(e.getSubHex(), e.getSubDesc()),
                new ColorGuideDTO.Role(e.getPointHex(), e.getPointDesc()),
                new ColorGuideDTO.Role(e.getBackgroundHex(), e.getBackgroundDesc())
        );

        return new ColorGuideResponse(
                e.getId(),
                e.getBriefKo(),
                e.getStyle(),
                e.getCaseType(),
                e.getSourceImage(),
                e.getCreatedBy().getEmail(),
                e.getCreatedAt(),
                e.getUpdatedAt(),
                guideDto,
                tagResponses
        );
    }
}