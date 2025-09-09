package com.example.logologolab.service.color;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.color.*;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.security.LoginUserProvider;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ColorGuideService {

    private final ColorGuideRepository repo;
    private final UserRepository userRepository;
    private final LoginUserProvider loginUserProvider;

    private static String normHex(String hex) {
        if (hex == null) return null;
        String s = hex.trim().toUpperCase();
        if (!s.startsWith("#")) s = "#" + s;
        return s.matches("^#[0-9A-F]{6}$") ? s : null;
    }

    @Transactional
    public ColorGuideResponse save(ColorGuidePersistRequest req, String createdBy) {
        if (req.guide() == null) throw new IllegalArgumentException("guide is required");

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        var g = req.guide();
        User creator = userRepository.findByEmail(createdBy)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        ColorGuide e = ColorGuide.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .project(null) // 프로젝트에 연결하지 않고 저장
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

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listByProject(Long projectId, Pageable pageable) {
        return repo.findByProjectId(projectId, pageable)
                .map(e -> new ColorGuideListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getMainHex(), e.getPointHex(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listMine(String email, Pageable pageable) {
        if (email == null || email.isBlank()) {
            // 인증 필수라면 예외를 던지거나, 빈 페이지 반환 등 정책 결정
            return Page.empty(pageable);
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        return repo.findByCreatedBy(user, pageable)
                .map(e -> new ColorGuideListItem(
                        e.getId(), e.getBriefKo(), e.getStyle(), e.getMainHex(), e.getPointHex(), e.getCreatedAt()
                ));
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listPublic(Pageable pageable) {
        return repo.findAll(pageable)
                .map(e -> new ColorGuideListItem(
                        e.getId(), e.getBriefKo(), e.getStyle(), e.getMainHex(), e.getPointHex(), e.getCreatedAt()
                ));
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

        repo.delete(colorGuide);
    }
}