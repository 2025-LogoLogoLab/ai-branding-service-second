package com.example.logologolab.dto.tag;

import java.util.List;

public record TagListResponse(
        List<TagResponse> tagList
) {}