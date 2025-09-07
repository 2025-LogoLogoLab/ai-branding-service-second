package com.example.logologolab.dto.brand;

import io.swagger.v3.oas.annotations.media.Schema;

public record BrandStrategyUpdateRequest(
        @Schema(description = "수정할 마크다운 본문", required = true)
        String markdown
) {}