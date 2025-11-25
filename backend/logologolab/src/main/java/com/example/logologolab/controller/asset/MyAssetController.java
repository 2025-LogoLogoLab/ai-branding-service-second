package com.example.logologolab.controller.asset;

import com.example.logologolab.dto.asset.AssetListItem;
import com.example.logologolab.dto.asset.MyProductsResponse;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.tag.TagResponse;
import com.example.logologolab.service.asset.MyAssetService;
import com.example.logologolab.dto.tag.TagListResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "07. 내 산출물 관리", description = "산출물 관리 페이지 관련 API")
@SecurityRequirement(name = "bearerAuth")
public class MyAssetController {

    private final MyAssetService myAssetService;

    @Operation(summary = "내 모든 산출물 통합 조회", description = "산출물 관리 페이지의 기본 데이터 로딩에 사용됩니다. 로고, 컬러 가이드, 브랜딩 전략을 종류별로 묶어서 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = MyProductsResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                                "code": "UNAUTHENTICATED_USER",
                                "message": "로그인이 필요한 요청입니다.",
                                "status": 401
                            }
                            """))),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                                "code": "INTERNAL_SERVER_ERROR",
                                "message": "알 수 없는 오류가 발생했습니다.",
                                "status": 500
                            }
                            """)))
    })
    @GetMapping("/api/my-products")
    public MyProductsResponse getMyProducts() {
        return myAssetService.getMyProducts();
    }

    /*@Operation(summary = "내 프로젝트 목록 조회", description = "산출물 관리 페이지의 프로젝트 기준 보기에 사용됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                                "code": "UNAUTHENTICATED_USER",
                                "message": "로그인이 필요한 요청입니다.",
                                "status": 401
                            }
                            """)))
    })
    @GetMapping("/api/my-projects")
    public List<ProjectListItem> getMyProjects() {
        return myAssetService.listMyProjects();
    }*/

    @Operation(summary = "내가 사용한 태그 목록 조회", description = "산출물 관리 페이지의 태그 기준 보기에 사용됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = TagListResponse.class),
                            examples = @ExampleObject(
                                    name = "태그 목록 응답",
                                    value = """
                                    {
                                      "tagList": [
                                        { "id": 101, "name": "패션" },
                                        { "id": 102, "name": "SNS" }
                                      ]
                                    }
                                    """
                            )
                    )
            ),
            @ApiResponse(responseCode = "401", description = "인증 실패",
                    content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                            {
                                "code": "UNAUTHENTICATED_USER",
                                "message": "로그인이 필요한 요청입니다.",
                                "status": 401
                            }
                            """)))
    })
    @GetMapping("/api/my-tags")
    public TagListResponse getMyTags() {
        return myAssetService.listMyTags();
    }

    @Operation(summary = "태그별 내 산출물 목록 조회 (페이징)", description = "특정 태그를 선택했을 때 해당하는 내 산출물을 페이징하여 최신순으로 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = PageResponse.class), // ArraySchema 대신 PageResponse 사용
                            examples = @ExampleObject(
                                    name = "자산 목록 응답 (페이징)",
                                    value = """
                                    {
                                      "content": [
                                        {
                                          "id": 77,
                                          "assetType": "BRAND_STRATEGY",
                                          "title": "친환경 세제, 가족/펫 타깃.",
                                          "thumbnailUrl": null,
                                          "createdAt": "2025-09-09T15:30:00.123456Z"
                                        },
                                        {
                                          "id": 25,
                                          "assetType": "LOGO",
                                          "title": "a minimal logo...",
                                          "thumbnailUrl": "https://s3.ap-northeast-2.amazonaws.com/...",
                                          "createdAt": "2025-09-08T11:20:10.987654Z"
                                        }
                                      ],
                                      "page": 0,
                                      "size": 10,
                                      "totalElements": 2,
                                      "totalPages": 1,
                                      "last": true
                                    }
                                    """
                            )
                    )
            ),
            @ApiResponse(responseCode = "400", description = "필수 파라미터 누락"),
            @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/api/my-assets")
    public PageResponse<AssetListItem> getMyAssetsByTag(
            @Parameter(description = "조회할 태그 이름", required = true) @RequestParam String tag,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수") @RequestParam(defaultValue = "10") int size
    ) {
        // 1. Pageable 객체 생성 (정렬은 Service에서 직접 수행하므로 여기선 page, size만 전달)
        Pageable pageable = PageRequest.of(page, size);

        // 2. Service 호출 (Page<AssetListItem> 반환됨)
        Page<AssetListItem> resultPage = myAssetService.listMyAssetsByTag(tag, pageable);

        // 3. PageResponse로 변환하여 반환
        return new PageResponse<>(
                resultPage.getContent(),
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isLast()
        );
    }
}