package com.example.logologolab.controller.admin;

import com.example.logologolab.dto.brand.*;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.tag.TagRequest;
import com.example.logologolab.security.CustomUserPrincipal;
import com.example.logologolab.service.admin.AdminBrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "14. 관리자 브랜딩 전략 관리", description = "관리자 전용 브랜딩 전략 관리 및 태그 기능 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminBrandController {

    private final AdminBrandService adminBrandService;

    // 1. 생성
    @Operation(
            summary = "[관리자] 브랜딩 전략 생성",
            description = "GPT를 이용해 브랜딩 전략을 생성합니다.",
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
    @PostMapping(value = "/api/admin/brand-strategy/generate", produces = "text/markdown;charset=UTF-8")
    public ResponseEntity<String> generate(@RequestBody BrandStrategyRequest req) {
        String markdown = adminBrandService.generateBrandStrategy(req);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/markdown;charset=UTF-8"))
                .body(markdown);
    }

    // 2. 저장
    @Operation(
            summary = "[관리자] 브랜딩 전략 저장",
            description = "생성된 전략을 관리자 계정으로 저장합니다.",
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
    @PostMapping(value = "/api/admin/brand-strategy/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BrandStrategyResponse> save(
            @RequestBody BrandStrategyPersistRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal
    ) {
        var saved = adminBrandService.saveBrandStrategy(req, principal.getEmail(), principal.getProvider());
        return ResponseEntity.created(URI.create("/api/admin/brand-strategy/" + saved.id())).body(saved);
    }

    // 3. 리스트 조회
    @Operation(
            summary = "[관리자] 전체 브랜딩 전략 리스트 조회",
            description = "모든 전략을 최신순으로 조회합니다. projectId 입력 시 해당 프로젝트의 전략만 필터링합니다.",
            security = @SecurityRequirement(name = "bearerAuth"),
            parameters = {
                    @Parameter(name = "projectId", description = "Project ID (선택)"), // 설명 수정
                    @Parameter(name = "page", description = "0-base 페이지 인덱스 (기본 0)"),
                    @Parameter(name = "size", description = "페이지 크기 (기본 20)")
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
                                        { "id": 77, "briefKo": "친환경 세제...", "style": "minimal", "markdown": "###브랜드 컨셉\\n키워드: 조용한 럭셔리, 선물용...\\n브랜드 이미지 설명: ...\\n\\n###브랜드 포지셔닝\\n목표 고객: ...\\n차별화 포인트: ...\\n경쟁 우위 요소: ...\\n\\n###마케팅 전략\\nSNS 중심 홍보: ...\\n참여형 이벤트: ...\\n브랜드 스토리텔링: ...\\n굿즈 마케팅: ...\\n\\n###사업 꿀팁\\n마스코트 IP 확장: ...\\n콜라보레이션: ...\\n디지털 브랜딩 강화: ...\\n데이터 기반 개선: ...\", "createdAt": "2025-08-24T11:22:33.123456" }
                                      ],
                                      "page": 0,
                                      "size": 12,
                                      "totalElements": 1,
                                      "totalPages": 1,
                                      "last": true
                                    }"""
                            )))
    })
    @GetMapping("/api/admin/brand-strategies")
    public PageResponse<BrandStrategyListItem> getAll(
            @Parameter(description = "프로젝트 ID") @RequestParam(required = false) Long projectId, // 👈 추가
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 사이즈") @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // 서비스 호출 시 projectId 전달
        Page<BrandStrategyListItem> result = adminBrandService.getAllBrandStrategies(projectId, pageable);

        return new PageResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // 4. 상세 조회
    @Operation(
            summary = "[관리자] 상세 조회",
            description = "ID로 브랜딩 전략 상세 정보를 조회합니다.",
            parameters = @Parameter(name = "id", description = "BrandStrategy ID", required = true)
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyResponse.class))),
            @ApiResponse(responseCode = "404", description = "존재하지 않는 ID")
    })
    @GetMapping("/api/admin/brand-strategy/{id}")
    public ResponseEntity<BrandStrategyResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminBrandService.getBrandStrategyDetail(id));
    }

    // 5. 수정
    @Operation(
            summary = "[관리자] 수정",
            description = "브랜딩 전략의 마크다운 내용을 수정합니다.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = BrandStrategyResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "401", description = "인증 실패"),
            @ApiResponse(responseCode = "404", description = "항목을 찾을 수 없거나 권한 없음")
    })
    @PatchMapping("/api/admin/brand-strategy/{id}")
    public ResponseEntity<BrandStrategyResponse> update(
            @PathVariable Long id,
            @RequestBody BrandStrategyUpdateRequest req
    ) {
        return ResponseEntity.ok(adminBrandService.updateBrandStrategy(id, req));
    }

    // 6. 삭제
    @Operation(summary = "[관리자] 삭제", description = "브랜딩 전략을 강제로 삭제합니다.")
    @DeleteMapping("/api/admin/brand-strategy/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        adminBrandService.deleteBrandStrategyAny(id);
        return ResponseEntity.ok(Map.of("message", "관리자 권한으로 브랜딩 전략이 삭제되었습니다."));
    }

    // 7. 태그 달기
    @Operation(
            summary = "[관리자] 태그 수정/할당",
            description = "브랜딩 전략에 태그를 설정합니다 (기존 태그 덮어쓰기)."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "할당할 태그 이름 목록 (최대 5개)",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TagRequest.class),
                    examples = @ExampleObject(
                            name = "태그 할당 요청 예시",
                            value = """
                                    {
                                      "tagNames": ["#마케팅", "#사업전략"]
                                    }
                                    """
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "태그 할당 성공",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class),
                            examples = @ExampleObject(value = "{\"message\": \"브랜딩 전략에 태그 달기가 완료되었습니다.\"}")
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 태그를 6개 이상 보내는 경우)", content = @Content),
            @ApiResponse(responseCode = "401", description = "인증 실패 (JWT 토큰 누락 또는 만료)", content = @Content),
            @ApiResponse(responseCode = "404", description = "브랜딩 전략을 찾을 수 없거나 현재 사용자의 소유가 아님", content = @Content)
    })
    @PostMapping("/api/admin/brand-strategy/{id}/tags")
    public ResponseEntity<BrandStrategyResponse> updateTags(
            @PathVariable Long id,
            @Valid @RequestBody TagRequest req
    ) {
        BrandStrategyResponse response = adminBrandService.updateTags(id, req.tagNames());
        return ResponseEntity.ok(response);
    }
}