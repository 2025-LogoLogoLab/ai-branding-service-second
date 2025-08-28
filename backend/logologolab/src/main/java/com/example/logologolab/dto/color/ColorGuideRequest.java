package com.example.logologolab.dto.color;

public record ColorGuideRequest(
        String briefKo,   // 텍스트 설명
        String style,     // optional (없으면 minimal)
        String imageUrl,  // optional (https URL)
        String base64     // optional (data:image/png;base64,....)
) {}