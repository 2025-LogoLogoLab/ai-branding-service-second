package com.example.logologolab.controller.logo;

import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.logo.LogoPromptRequest;
import com.example.logologolab.dto.logo.LogoResponse;
import com.example.logologolab.domain.User;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.service.logo.LogoGenerationService;
import com.example.logologolab.service.logo.LogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "12. 로고", description = "로고 관련 API")
public class LogoController {

    private final LogoGenerationService logoGenerationService;
    private final LogoService logoService;
    private final LoginUserProvider loginUserProvider;

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
                      "type": "COMBO",
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
            value = "/api/logo/generate",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> generateLogo(@Valid @RequestBody LogoPromptRequest req) {
        List<String> images = logoGenerationService.generateLogo(
                req.getPrompt(),
                req.getStyle(),
                req.getType(),
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
            value = "/api/logo/save",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, String>> downloadAndSave(@RequestBody Map<String, String> request) {
        User user = loginUserProvider.getLoginUser();

        String prompt = request.get("prompt");
        String base64 = request.get("base64");

        String imageUrl = logoGenerationService.saveLogoToS3AndDb(user, prompt, base64);

        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @Operation(summary = "로고 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공", content = @Content(schema = @Schema(implementation = LogoResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "로고를 찾을 수 없거나 권한 없음")
    })
    @GetMapping("/api/logo/{id}")
    public ResponseEntity<LogoResponse> getLogo(@PathVariable Long id) {
        LogoResponse response = logoService.getLogo(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "로고 리스트 조회", description = "내 로고 또는 특정 프로젝트의 로고 리스트를 최신순으로 조회합니다.", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/api/logos")
    public PageResponse<LogoListItem> listLogos(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "'mine' 입력 시 내 로고만 조회") @RequestParam(required = false) String filter
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LogoListItem> resultPage;

        // "mine" 필터가 있고, 실제로 로그인한 상태일 때
        if ("mine".equalsIgnoreCase(filter)) {
            // getLoginUser()는 비로그인 시 예외를 발생시켜 401 Unauthorized 응답을 유도합니다.
            User user = loginUserProvider.getLoginUser();
            resultPage = logoService.listMyLogos(pageable);
        } else {
            // 필터가 없으면 기존처럼 전체 목록을 보여줍니다.
            resultPage = logoService.listPublicLogos(pageable);
        }

        return new PageResponse<>(resultPage.getContent(), resultPage.getNumber(), resultPage.getSize(),
                resultPage.getTotalElements(), resultPage.getTotalPages(), resultPage.isLast());
    }

    @Operation(summary = "로고 삭제", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses({
            @ApiResponse(responseCode = "24", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "로고를 찾을 수 없거나 권한 없음")
    })
    @DeleteMapping("/api/logo/{id}")
    public ResponseEntity<Map<String, String>> deleteLogo(@PathVariable Long id) {
        logoService.deleteLogo(id);

        Map<String, String> response = Map.of("message", "로고 삭제가 완료되었습니다.");

        return ResponseEntity.ok(response);
    }
}
