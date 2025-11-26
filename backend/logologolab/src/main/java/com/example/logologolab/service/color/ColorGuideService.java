package com.example.logologolab.service.color;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.color.*;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.service.s3.S3UploadService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ColorGuideService {

    private final ColorGuideRepository repo;
    private final UserRepository userRepository;
    private final LoginUserProvider loginUserProvider;
    private final S3UploadService s3UploadService;
    private final ProjectRepository projectRepository;

    private static String normHex(String hex) {
        if (hex == null) return null;
        String s = hex.trim().toUpperCase();
        if (!s.startsWith("#")) s = "#" + s;
        return s.matches("^#[0-9A-F]{6}$") ? s : null;
    }

    @Transactional
    public ColorGuideResponse save(ColorGuidePersistRequest req, String createdByEmail, ProviderType createdByProvider) {
        if (req.guide() == null) throw new IllegalArgumentException("guide is required");

        // 1. 이미지 처리 로직 추가 (Base64 -> S3 URL 변환)
        String finalImageUrl = null;
        if (req.imageUrl() != null && !req.imageUrl().isBlank()) {
            if (req.imageUrl().startsWith("data:")) {
                // Base64 문자열이면 S3 업로드 후 URL 획득
                finalImageUrl = s3UploadService.uploadBase64AndGetUrl(req.imageUrl());
            } else {
                // 이미 URL 형태면 그대로 사용
                finalImageUrl = req.imageUrl();
            }
        }

        var style = Style.safeOf(req.style());
        // URL 존재 여부로 CaseType 결정
        var caseType = (finalImageUrl != null) ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        var g = req.guide();
        User creator = userRepository.findByEmailAndProvider(createdByEmail, createdByProvider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        ColorGuide e = ColorGuide.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(finalImageUrl)
                .createdBy(creator)
                .mainHex(normHex(g.main().hex())).mainDesc(g.main().description())
                .subHex(normHex(g.sub().hex())).subDesc(g.sub().description())
                .pointHex(normHex(g.point().hex())).pointDesc(g.point().description())
                .backgroundHex(normHex(g.background().hex())).backgroundDesc(g.background().description())
                .build();

        e = repo.save(e);

        return ColorGuideResponse.from(e);
    }

    @Transactional(readOnly = true)
    public ColorGuideResponse get(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없습니다."));

        return ColorGuideResponse.from(e);
    }

    // [Helper] 엔티티를 ColorGuideListItem으로 변환하는 메서드 (중복 제거용)
    private ColorGuideListItem mapToListItem(ColorGuide e) {
        return new ColorGuideListItem(
                e.getId(),
                e.getBriefKo(),
                e.getStyle(),
                new ColorGuideDTO(
                        new ColorGuideDTO.Role(e.getMainHex(), e.getMainDesc()),
                        new ColorGuideDTO.Role(e.getSubHex(), e.getSubDesc()),
                        new ColorGuideDTO.Role(e.getPointHex(), e.getPointDesc()),
                        new ColorGuideDTO.Role(e.getBackgroundHex(), e.getBackgroundDesc())
                ),
                e.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listMine(String email, ProviderType provider, Pageable pageable) {
        if (email == null || email.isBlank()) {
            // 인증 필수라면 예외를 던지거나, 빈 페이지 반환 등 정책 결정
            return Page.empty(pageable);
        }
        User user = userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        return repo.findByCreatedBy(user, pageable)
                .map(this::mapToListItem);
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listPublic(Pageable pageable) {
        return repo.findAll(pageable)
                .map(this::mapToListItem);
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listByProject(Long projectId, Pageable pageable) {
        if (projectId == null) return Page.empty(pageable);
        return repo.findByProjectId(projectId, pageable)
                .map(this::mapToListItem);
    }

    @Transactional
    public ColorGuideResponse update(Long id, ColorGuideUpdateRequest req) {
        // 1. 현재 로그인한 사용자 정보 가져오기
        User currentUser = loginUserProvider.getLoginUser();

        // 2. 수정할 데이터가 현재 사용자의 소유인지 확인하며 조회
        ColorGuide entity = repo.findByIdAndCreatedBy(id, currentUser)
                .orElseThrow(() -> new NoSuchElementException("수정할 컬러 가이드를 찾을 수 없거나 권한이 없습니다."));

        // 3. 필드 업데이트
        ColorGuideDTO newGuide = req.guide();
        entity.updateGuide(
                normHex(newGuide.main().hex()), newGuide.main().description(),
                normHex(newGuide.sub().hex()), newGuide.sub().description(),
                normHex(newGuide.point().hex()), newGuide.point().description(),
                normHex(newGuide.background().hex()), newGuide.background().description()
        );

        // 4. 수정된 결과를 DTO로 변환하여 반환
        return ColorGuideResponse.from(entity);
    }

    @Transactional
    public void deleteColorGuide(Long id) {
        User user = loginUserProvider.getLoginUser(); // 로그인한 사용자 정보 조회

        // ID와 사용자 정보로 데이터를 조회하여 소유권 확인
        ColorGuide colorGuide = repo.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new NoSuchElementException("삭제할 컬러 가이드를 찾을 수 없거나 권한이 없습니다."));

        // 1. 이 컬러 가이드를 담고 있는 모든 프로젝트를 찾음
        List<Project> projects = projectRepository.findAllByColorGuideId(id);

        // 2. 프로젝트들에서 해당 컬러 가이드 제거 (JPA가 중간 테이블 row 삭제)
        for (Project project : projects) {
            project.getColorGuides().remove(colorGuide);
        }

        // 3. 이제 안전하게 삭제
        repo.delete(colorGuide);
    }
}