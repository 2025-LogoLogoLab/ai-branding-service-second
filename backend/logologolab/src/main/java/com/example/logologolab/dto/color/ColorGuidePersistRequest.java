package com.example.logologolab.dto.color;

public record ColorGuidePersistRequest(
        String briefKo,
        String style,      // optional
        String imageUrl,   // optional (S3 URL)
        Long projectId,    // optional (Project 생기면 FK로 연결)
        ColorGuideDTO guide // 생성 API 응답 그대로
) {}
