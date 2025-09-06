package com.example.logologolab.controller.logo;

import com.example.logologolab.dto.logo.LogoPromptRequest;
import com.example.logologolab.service.logo.LogoGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "로고", description = "로고 관련 API")
public class LogoController {

    private final LogoGenerationService logoGenerationService;

    @Operation(
            summary = "로고 생성",
            description = "프롬프트와 스타일을 기반으로 로고 이미지를 생성합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "로고 생성 요청 바디",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LogoPromptRequest.class,
                                    example = """
                    {
                      "prompt": "빈티지 스타일의 홍익대 로고 만들어줘",
                      "style": "vintage",
                      "negative_prompt": "no watermark, no extra text",
                      "steps": 50,
                      "guidanceScale": 3.5,
                      "width": 1024,
                      "height": 1024,
                      "num_images": 2
                    }
                    """)
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "로고 생성 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = """
                            {
                              "images": [
                                "data:image/png;base64,iVBORw0KGgo...",
                                "data:image/png;base64,AbCdEfGh..."
                              ]
                            }
                            """))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping(
            value = "/api/logos/generate",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> generateLogo(@Valid @RequestBody LogoPromptRequest req) {
        List<String> images = logoGenerationService.generateLogo(
                req.getPrompt(),
                req.getStyle(),
                req.getNegative_prompt(),     // DTO가 snake_case 게터를 제공한다고 가정
                req.getSteps(),
                req.getGuidanceScale(),
                req.getWidth(),
                req.getHeight(),
                req.getNum_images()
        );
        return ResponseEntity.ok(Map.of("images", images));
    }

    @Operation(
            summary = "로고 저장",
            description = "생성된 로고 이미지를 S3와 DB에 저장하고 URL을 반환합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "저장할 프롬프트와 base64 인코딩된 이미지",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = """
                {
                  "prompt": "빈티지 스타일의 홍익대 로고, style: vintage, type: icon with text",
                  "base64": "data:image/png;base64,iVBORw0KGgo..."
                }
                """))
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "로고 저장 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(example = "{ \"imageUrl\": \"https://s3.ap-northeast-2.amazonaws.com/your-bucket/logos/2025/08/11/abc123.png\" }"))
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping(
            value = "/api/logos/save",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> downloadAndSave(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        String base64 = request.get("base64");
        String imageUrl = logoGenerationService.saveLogoToS3AndDb(prompt, base64);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
