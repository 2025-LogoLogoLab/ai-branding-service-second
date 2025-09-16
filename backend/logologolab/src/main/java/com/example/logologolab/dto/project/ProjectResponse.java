package com.example.logologolab.dto.project;

import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.BrandStrategy;
import com.example.logologolab.domain.ColorGuide;
import com.example.logologolab.domain.Logo;
import java.util.List;
import java.util.stream.Collectors;

public record ProjectResponse(
        String name,
        List<ProjectContent> contents
) {
    public static ProjectResponse from(Project project) {
        // Project에 연결된 모든 콘텐츠를 통합하여 DTO로 변환
        List<ProjectContent> combinedContents = project.getBrandStrategies().stream()
                .map(bs -> new ProjectContent(bs.getId(), "BrandStrategy", bs.getCreatedAt()))
                .collect(Collectors.toList());

        combinedContents.addAll(project.getColorGuides().stream()
                .map(cg -> new ProjectContent(cg.getId(), "ColorGuide", cg.getCreatedAt()))
                .collect(Collectors.toList()));

        combinedContents.addAll(project.getLogos().stream()
                .map(l -> new ProjectContent(l.getId(), "Logo", l.getCreatedAt()))
                .collect(Collectors.toList()));

        return new ProjectResponse(project.getName(), combinedContents);
    }
}