package com.example.logologolab.dto.tag;

import jakarta.validation.constraints.Size;
import java.util.List;

public record TagRequest(
        @Size(max = 5, message = "태그는 최대 5개까지 지정할 수 있습니다.")
        List<String> tagNames
) {}