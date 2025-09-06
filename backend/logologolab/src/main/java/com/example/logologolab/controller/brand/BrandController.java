package com.example.logologolab.controller.brand;

import com.example.logologolab.dto.brand.BrandStrategyRequest;
import com.example.logologolab.service.gpt.GptPromptService;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.brand.BrandStrategyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.Operation;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;


@RestController
@RequiredArgsConstructor
@Tag(name = "브랜딩 전략", description = "브랜딩 전략 관련 API")
public class BrandController {

    private final GptPromptService gpt;

    @Operation(
            summary = "브랜딩 전략 생성",
            description = "브리프(텍스트)만 또는 텍스트+로고 이미지(이미지 URL 또는 data:base64)를 입력하면 마크다운 섹션 포맷의 브랜딩 전략 문자열을 반환합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "브랜딩 전략 요청 바디",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "텍스트만",
                                            summary = "텍스트만으로 브랜딩 전략 생성",
                                            value = """
                        {
                          "briefKo": "친환경 세제, 가족/펫 타깃. 전국 마트 입점 목표, 팝업 예정.",
                          "style": "minimal"
                        }
                        """
                                    ),
                                    @ExampleObject(
                                            name = "텍스트+이미지",
                                            summary = "로고 이미지 기반 브랜딩 전략 생성",
                                            value = """
                        {
                          "briefKo": "첨부 로고 기준으로 활용 전략만 제시. HEX 수치 제시는 피함.",
                          "style": "minimal",
                          "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                        }
                        """
                                    )
                            }
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "브랜딩 전략 생성 성공",
                    content = @Content(
                            mediaType = "text/markdown",
                            schema = @Schema(example = """
                ###브랜드 컨셉
                키워드: 지속가능성(Sustainability), 안전성(Safety), 가족(Family), 반려동물(Pet-friendly)
                브랜드 이미지 설명: 저자극·무향료 포뮬러를 깨끗한 패키지와 투명한 성분 공개로 전달. 일상 세탁에서 가족·펫 모두 안심하고 쓸 수 있는 친환경 세제를 지향.

                ###브랜드 포지셔닝
                목표 고객: 영유아/반려 가정, 알레르기 민감층, 친환경 소비 성향 20~40대
                차별화 포인트: 성분 투명성, 저자극 테스트, 재활용 패키지
                경쟁 우위 요소: 후기 데이터 기반 레시피 개선, 리필 스테이션, 파트너십 채널

                ###마케팅 전략
                SNS 중심 홍보: 세탁 팁 릴스, 성분 카드뉴스, 사용 전후 비교
                참여형 이벤트: 공병 수거 리워드, 리필 데이, 세탁 클래스
                브랜드 스토리텔링: 원료 소싱·검증 과정 공개, 개발자 인터뷰
                굿즈 마케팅: 로고 세탁망·계량컵·리필 보틀

                ###사업 꿀팁
                마스코트 IP 확장: 물방울 캐릭터를 라벨/사인에 일관 적용
                콜라보레이션: 키즈/펫 브랜드, 리필 스테이션, 호텔·세탁소
                디지털 브랜딩 강화: 구독/리마인더·리필 알림, 후기 자동 수집
                데이터 기반 개선: SKU별 회전·재구매 주기·CAC/LTV 분석
                """)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터", content = @Content),
            @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @PostMapping(value="/api/brand-strategy/generate", produces="text/markdown;charset=UTF-8")
    public ResponseEntity<String> strategy(@RequestBody BrandStrategyRequest req) {
        String style = (req.style() == null) ? "minimal" : req.style();

        String img = null;
        if (req.base64() != null && req.base64().startsWith("data:")) img = req.base64();
        else if (req.imageUrl() != null && !req.imageUrl().isBlank()) img = req.imageUrl();

        String markdown = (img != null)
                ? gpt.generateBrandingStrategyFromImage(req.briefKo(), style, img)
                : gpt.generateBrandingStrategyTextOnly(req.briefKo(), style);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/markdown;charset=UTF-8"))
                .body(markdown);
    }

    private final BrandStrategyService service;

    @Operation(
            summary = "브랜딩 전략 저장(이미 생성된 결과 영속화)",
            description = "생성 API 응답(markdown)을 포함하여 DB에 저장합니다.",
            security = @SecurityRequirement(name = "bearerAuth"),
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyPersistRequest.class),
                            examples = @ExampleObject(
                                    name = "저장 요청 예시",
                                    value = """
                                    {
                                      "briefKo": "친환경 세제, 가족/펫 타깃. 전국 마트 입점 목표.",
                                      "style": "minimal",
                                      "imageUrl": "https://s3.ap-northeast-2.amazonaws.com/your-bucket/logo.png",
                                      "projectId": 1,
                                      "markdown": "###브랜드 컨셉\\n키워드: 지속가능성, 안전성...\\n\\n###브랜드 포지셔닝\\n..."
                                    }"""
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "저장 성공 (Location 헤더 포함)",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyResponse.class),
                            examples = @ExampleObject(
                                    name = "저장 응답 예시",
                                    value = """
                                    {
                                      "id": 77,
                                      "briefKo": "친환경 세제, 가족/펫 타깃. 전국 마트 입점 목표.",
                                      "style": "minimal",
                                      "caseType": "WITH_LOGO",
                                      "sourceImage": "https://s3.ap-northeast-2.amazonaws.com/your-bucket/logo.png",
                                      "projectId": 1,
                                      "createdBy": "you@example.com",
                                      "createdAt": "2025-08-24T11:22:33.123456",
                                      "updatedAt": "2025-08-24T11:22:33.123456",
                                      "markdown": "###브랜드 컨셉\\n키워드: ..."
                                    }"""
                            ))),
            @ApiResponse(responseCode = "400", description = "유효성 오류(markdown 누락 등)"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping(value = "/api/brand-strategy/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BrandStrategyResponse> save(
            @RequestBody BrandStrategyPersistRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        final String createdBy = (principal != null) ? principal.getEmail() : null;
        var saved = service.save(req, createdBy);
        return ResponseEntity.created(URI.create("/api/brand-strategie/" + saved.id())).body(saved);
    }

    @Operation(
            summary = "브랜딩 전략 상세 조회",
            security = @SecurityRequirement(name = "bearerAuth"),
            parameters = @Parameter(name = "id", description = "BrandStrategy ID", required = true)
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyResponse.class))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 ID")
    })
    @GetMapping(value = "/api/brand-strategy/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public BrandStrategyResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(
            summary = "브랜딩 전략 목록 조회",
            description = "projectId가 있으면 프로젝트 기준, 없으면 내 데이터(createdBy) 기준으로 최신순 조회.",
            security = @SecurityRequirement(name = "bearerAuth"),
            parameters = {
                    @Parameter(name = "projectId", description = "Project ID (선택)"),
                    @Parameter(name = "page", description = "0-base 페이지 인덱스 (기본 0)"),
                    @Parameter(name = "size", description = "페이지 크기 (기본 12)")
            }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "목록 조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class),
                            examples = @ExampleObject(
                                    value = """
                                    {
                                      "content": [
                                        { "id": 77, "briefKo": "친환경 세제...", "style": "minimal", "createdAt": "2025-08-24T11:22:33.123456" }
                                      ],
                                      "page": 0,
                                      "size": 12,
                                      "totalElements": 1,
                                      "totalPages": 1,
                                      "last": true
                                    }"""
                            )))
    })
    @GetMapping(value = "/api/brand-strategies", produces = MediaType.APPLICATION_JSON_VALUE)
    public PageResponse<BrandStrategyListItem> list(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BrandStrategyListItem> p = (projectId != null)
                ? service.listByProject(projectId, pageable)
                : service.listMine((principal != null) ? principal.getEmail() : null, pageable);

        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }
}
