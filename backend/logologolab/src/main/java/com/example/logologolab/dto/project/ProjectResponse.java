package com.example.logologolab.dto.project;

import com.example.logologolab.domain.*;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

@Builder
public record ProjectResponse(
        Long id,
        String name,
        List<Long> logoIds,
        List<Long> brandStrategyIds,
        List<Long> colorGuideIds,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    public static ProjectResponse of(Project p,
                                     List<BrandStrategy> bsList,
                                     List<ColorGuide> cgList,
                                     List<Logo> lgList) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                // Logo 엔티티 리스트 -> ID 리스트 변환
                lgList == null ? Collections.emptyList() : lgList.stream().map(Logo::getId).toList(),
                // BrandStrategy 엔티티 리스트 -> ID 리스트 변환
                bsList == null ? Collections.emptyList() : bsList.stream().map(BrandStrategy::getId).toList(),
                // ColorGuide 엔티티 리스트 -> ID 리스트 변환
                cgList == null ? Collections.emptyList() : cgList.stream().map(ColorGuide::getId).toList(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}