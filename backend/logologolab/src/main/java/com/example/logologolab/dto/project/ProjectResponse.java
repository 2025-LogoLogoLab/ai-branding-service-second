package com.example.logologolab.dto.project;

import com.example.logologolab.domain.*;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;
import java.time.OffsetDateTime;

@Builder
public record ProjectResponse(
        Long id,
        String name,
        List<ContentItem> contents
) {
    // 기존 from(Project) 단순 변환
    public static ProjectResponse from(Project p) {
        return new ProjectResponse(
                p.getId(),
                p.getName(),
                new ArrayList<>() // contents는 비어 있음
        );
    }

    // 새로 추가: 엔티티 + 연관된 컬렉션 리스트로 응답 구성
    public static ProjectResponse of(Project p,
                                     List<BrandStrategy> bsList,
                                     List<ColorGuide> cgList,
                                     List<Logo> lgList) {
        List<ContentItem> items = new ArrayList<>();

        for (BrandStrategy bs : bsList) {
            items.add(ContentItem.ofBrandStrategy(bs));
        }
        for (ColorGuide cg : cgList) {
            items.add(ContentItem.ofColorGuide(cg));
        }
        for (Logo lg : lgList) {
            items.add(ContentItem.ofLogo(lg));
        }

        // createdAt 기준 정렬 (원하면)
        items.sort((a, b) -> b.createdAt.compareTo(a.createdAt));

        return new ProjectResponse(
                p.getId(),
                p.getName(),
                items
        );
    }

    // 내부 서브 DTO
    public record ContentItem(
            String type,   // "BRAND_STRATEGY", "COLOR_GUIDE", "LOGO"
            Long id,
            String title,  // briefKo나 prompt 등 요약 텍스트
            String imageUrl,
            OffsetDateTime createdAt
    ) {
        static ContentItem ofBrandStrategy(BrandStrategy bs) {
            return new ContentItem(
                    "BRAND_STRATEGY",
                    bs.getId(),
                    bs.getBriefKo(),
                    null,
                    bs.getCreatedAt()
            );
        }

        static ContentItem ofColorGuide(ColorGuide cg) {
            return new ContentItem(
                    "COLOR_GUIDE",
                    cg.getId(),
                    cg.getBriefKo(),
                    null,
                    cg.getCreatedAt()
            );
        }

        static ContentItem ofLogo(Logo lg) {
            return new ContentItem(
                    "LOGO",
                    lg.getId(),
                    lg.getPrompt(),
                    lg.getImageUrl(),
                    lg.getCreatedAt()
            );
        }
    }
}
