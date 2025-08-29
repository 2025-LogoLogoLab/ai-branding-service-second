package com.example.logologolab.dto.color;

public record ColorGuideDTO(
        Role main,
        Role sub,
        Role point,
        Role background
) {
    public record Role(String hex, String description) {}
}