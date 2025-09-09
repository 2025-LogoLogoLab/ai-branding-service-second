package com.example.logologolab.dto.tag;

import com.example.logologolab.domain.Tag;

public record TagResponse(Long id, String name) {
    public static TagResponse from(Tag tag) {
        return new TagResponse(tag.getId(), tag.getName());
    }
}