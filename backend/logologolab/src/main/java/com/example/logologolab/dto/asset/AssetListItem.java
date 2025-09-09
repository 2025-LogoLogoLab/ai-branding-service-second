package com.example.logologolab.dto.asset;

import com.example.logologolab.domain.BrandStrategy;
import com.example.logologolab.domain.ColorGuide;
import com.example.logologolab.domain.Logo;

import java.time.OffsetDateTime;

public record AssetListItem(
        Long id,
        String assetType, // "LOGO", "COLOR_GUIDE", "BRAND_STRATEGY"
        String title,
        String thumbnailUrl, // 로고 이미지 URL 등
        OffsetDateTime createdAt
) {
    // Logo -> AssetListItem 변환
    public static AssetListItem from(Logo logo) {
        return new AssetListItem(logo.getId(), "LOGO", logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt());
    }

    // ColorGuide -> AssetListItem 변환
    public static AssetListItem from(ColorGuide colorGuide) {
        // 컬러 가이드는 대표 썸네일 이미지가 없으므로 null 처리 (프론트에서 타입에 따라 아이콘 표시)
        return new AssetListItem(colorGuide.getId(), "COLOR_GUIDE", colorGuide.getBriefKo(), null, colorGuide.getCreatedAt());
    }

    // BrandStrategy -> AssetListItem 변환
    public static AssetListItem from(BrandStrategy brandStrategy) {
        return new AssetListItem(brandStrategy.getId(), "BRAND_STRATEGY", brandStrategy.getBriefKo(), null, brandStrategy.getCreatedAt());
    }
}