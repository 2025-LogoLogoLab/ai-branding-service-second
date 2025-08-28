package com.example.logologolab.dto.common;

import com.example.logologolab.dto.meta.Meta;
import jakarta.annotation.Nullable;

import java.util.List;

public record PaginatedResponse<T>(
        List<T> data,
        @Nullable Meta meta
) {
}
