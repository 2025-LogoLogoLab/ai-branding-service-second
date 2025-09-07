package com.example.logologolab.dto.color;

import io.swagger.v3.oas.annotations.media.Schema;

public record ColorGuideUpdateRequest(
        @Schema(description = "수정할 컬러 가이드 객체", required = true)
        ColorGuideDTO guide
) {}