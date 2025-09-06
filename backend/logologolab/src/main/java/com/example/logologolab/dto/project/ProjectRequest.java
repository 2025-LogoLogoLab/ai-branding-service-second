package com.example.logologolab.dto.project;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import java.util.List;

@Getter
public class ProjectRequest {
    @NotBlank(message = "프로젝트 이름은 필수입니다.")
    private String name;
    private List<Long> brandStrategyIds;
    private List<Long> colorGuideIds;
    private List<Long> logoIds;
}