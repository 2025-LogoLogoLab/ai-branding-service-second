package com.example.logologolab.dto.color;

public record ColorGuidePersistRequest(
        String briefKo,
        String style,      // optional
        String imageUrl,   // optional (S3 URL)
        ColorGuideDTO guide // 생성 API 응답 그대로
) {}
