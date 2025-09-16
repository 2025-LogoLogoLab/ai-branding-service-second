package com.example.logologolab.dto.brand;

public record BrandStrategyPersistRequest(
        String briefKo,
        String style,     // optional
        String imageUrl,  // optional (S3 URL)
        String markdown   // 생성 API 응답 그대로
) {}
