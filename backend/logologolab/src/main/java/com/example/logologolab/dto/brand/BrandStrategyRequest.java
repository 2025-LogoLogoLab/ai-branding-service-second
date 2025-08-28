package com.example.logologolab.dto.brand;

public record BrandStrategyRequest(
        String briefKo,   // 텍스트 설명
        String style,     // optional (없으면 minimal)
        String imageUrl,  // optional
        String base64     // optional
) {}
