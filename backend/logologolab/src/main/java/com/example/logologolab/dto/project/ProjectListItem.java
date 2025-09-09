package com.example.logologolab.dto.project;

import com.example.logologolab.domain.Project;

public record ProjectListItem(
        Long id,
        String name
) {
    public static ProjectListItem from(Project project) {
        return new ProjectListItem(project.getId(), project.getName());
    }
}