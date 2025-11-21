package com.example.logologolab.controller.admin;

import com.example.logologolab.domain.User;
import com.example.logologolab.dto.common.PageResponse;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.logo.LogoPromptRequest;
import com.example.logologolab.dto.logo.LogoResponse;
import com.example.logologolab.dto.tag.TagRequest;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.service.admin.AdminLogoService;
import com.example.logologolab.service.logo.LogoGenerationService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/logo")
@Tag(name = "관리자 - 로고", description = "관리자 전용 로고 관리 및 태그 기능 API")
@SecurityRequirement(name = "bearerAuth")
public class AdminLogoController {

    private final AdminLogoService adminLogoService;
    private final LogoGenerationService logoGenerationService;
    private final LoginUserProvider loginUserProvider;

    // 1. [관리자] 로고 생성 (테스트용)
    @Operation(summary = "[관리자] 로고 생성", description = "관리자 권한으로 로고를 생성합니다.")
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateLogoAdmin(@Valid @RequestBody LogoPromptRequest req) {
        List<String> images = logoGenerationService.generateLogo(
                req.getPrompt(), req.getStyle(), req.getType(), req.getNegative_prompt(),
                req.getSteps(), req.getGuidanceScale(), req.getWidth(), req.getHeight(), req.getNum_images()
        );
        return ResponseEntity.ok(Map.of("images", images));
    }

    // 2. [관리자] 로고 저장
    @Operation(summary = "[관리자] 로고 저장", description = "생성된 로고를 관리자 계정 명의로 저장합니다.")
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveLogoAdmin(@RequestBody Map<String, String> request) {
        User adminUser = loginUserProvider.getLoginUser(); // 현재 로그인한 관리자 정보
        String prompt = request.get("prompt");
        String base64 = request.get("base64");

        String imageUrl = logoGenerationService.saveLogoToS3AndDb(adminUser, prompt, base64);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    // 3. [관리자] 전체 로고 리스트 조회
    @Operation(summary = "[관리자] 전체 로고 리스트 조회", description = "사용자 구분 없이 모든 로고를 최신순으로 조회합니다.")
    @GetMapping("/list")
    public PageResponse<LogoListItem> getAllLogos(
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 당 항목 수") @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LogoListItem> result = adminLogoService.getAllLogos(pageable);

        return new PageResponse<>(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages(), result.isLast());
    }

    // 4. [관리자] 로고 상세 조회
    @Operation(summary = "[관리자] 로고 상세 조회", description = "ID를 통해 임의의 로고 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<LogoResponse> getLogoDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminLogoService.getLogoDetail(id));
    }

    // 5. [관리자] 로고 삭제
    @Operation(summary = "[관리자] 로고 강제 삭제", description = "ID를 통해 로고를 강제로 삭제합니다 (S3 파일 포함).")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLogoAdmin(@PathVariable Long id) {
        adminLogoService.deleteLogoAny(id);
        return ResponseEntity.ok(Map.of("message", "관리자 권한으로 로고가 삭제되었습니다."));
    }

    // 6. [관리자] 태그 달기
    @Operation(summary = "[관리자] 로고 태그 수정/할당", description = "로고에 태그를 설정합니다. 기존 태그는 입력된 태그 리스트로 덮어씌워집니다.")
    @PostMapping("/{id}/tags")
    public ResponseEntity<LogoResponse> updateTags(
            @PathVariable Long id,
            @Valid @RequestBody TagRequest req
    ) {
        LogoResponse response = adminLogoService.updateLogoTags(id, req.tagNames());
        return ResponseEntity.ok(response);
    }
}