package com.example.logologolab.dto.logo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LogoPromptRequest {
    @NotBlank
    private String prompt;

    @NotBlank
    private String style; // simple|minimal|retro|vintage|cute|playful|luxury|tattoo|futuristic|cartoon|watercolor|none

    // 옵션
    private String negative_prompt;
    @Positive
    private Integer steps;           // 기본 50
    private Double guidanceScale;    // 기본 3.5
    @Positive
    private Integer width;           // 기본 1024
    @Positive
    private Integer height;          // 기본 1024
    @Positive
    private Integer num_images;       // 기본 1
}
