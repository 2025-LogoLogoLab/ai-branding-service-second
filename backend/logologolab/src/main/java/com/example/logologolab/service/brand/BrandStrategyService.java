package com.example.logologolab.service.brand;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.domain.User;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.service.s3.S3UploadService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class BrandStrategyService {

    private final BrandStrategyRepository repo;
    private final UserRepository userRepository;
    private final LoginUserProvider loginUserProvider;
    private final S3UploadService s3UploadService;

    @Transactional
    public BrandStrategyResponse save(BrandStrategyPersistRequest req, String createdByEmail, ProviderType createdByProvider) {
        if (req.markdown() == null || req.markdown().isBlank())
            throw new IllegalArgumentException("markdown is required");

        User creator = userRepository.findByEmailAndProvider(createdByEmail, createdByProvider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        // 1. 이미지 처리 로직 추가 (Base64 -> S3 URL 변환)
        String finalImageUrl = null;
        if (req.imageUrl() != null && !req.imageUrl().isBlank()) {
            // 만약 "data:image"로 시작하는 Base64 문자열이라면 S3에 업로드
            if (req.imageUrl().startsWith("data:")) {
                finalImageUrl = s3UploadService.uploadBase64AndGetUrl(req.imageUrl());
            } else {
                // 이미 URL 형태라면 그대로 사용
                finalImageUrl = req.imageUrl();
            }
        }

        // 2. 케이스 타입 결정 (URL 존재 여부로 판단)
        var caseType = (finalImageUrl != null) ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;
        var style = Style.safeOf(req.style());

        BrandStrategy e = BrandStrategy.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(finalImageUrl)
                .markdown(req.markdown())
                .createdBy(creator)
                .build();

        e = repo.save(e);

        return BrandStrategyResponse.from(e);
    }

    @Transactional(readOnly = true)
    public BrandStrategyResponse get(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다."));

        return BrandStrategyResponse.from(e);
    }

    // [Helper] 엔티티 -> 리스트 아이템 변환 (중복 제거)
    private BrandStrategyListItem mapToListItem(BrandStrategy e) {
        return new BrandStrategyListItem(
                e.getId(),
                e.getBriefKo(),
                e.getStyle(),
                e.getMarkdown(),
                e.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listMine(String email, ProviderType provider, Pageable pageable) {
        if (email == null || email.isBlank()) return Page.empty(pageable);
        User user = userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        return repo.findByCreatedBy(user, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getMarkdown(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listPublic(Pageable pageable) {
        return repo.findAll(pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getMarkdown(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listByProject(Long projectId, Pageable pageable) {
        if (projectId == null) {
            return Page.empty(pageable);
        }

        // Repository에서 만든 쿼리 메서드 호출
        return repo.findByProjectId(projectId, pageable)
                .map(this::mapToListItem); // 기존에 만들어둔 변환 메서드 재활용
    }

    @Transactional
    public BrandStrategyResponse update(Long id, BrandStrategyUpdateRequest req) {
        // 1. 현재 로그인한 사용자 정보 가져오기
        User currentUser = loginUserProvider.getLoginUser();

        // 2. 수정할 데이터가 현재 사용자의 소유인지 확인하며 조회
        BrandStrategy entity = repo.findByIdAndCreatedBy(id, currentUser)
                .orElseThrow(() -> new NoSuchElementException("수정할 브랜딩 전략을 찾을 수 없거나 권한이 없습니다."));

        // 3. 필드 업데이트 (Dirty Checking으로 DB에 반영됨)
        entity.updateMarkdown(req.markdown());

        // 4. 수정된 결과를 DTO로 변환하여 반환
        return BrandStrategyResponse.from(entity);
    }

    @Transactional
    public void deleteBrandStrategy(Long id) {
        User user = loginUserProvider.getLoginUser(); // 로그인한 사용자 정보 조회 (없으면 예외 발생)

        // ID와 사용자 정보로 데이터를 조회하여 소유권 확인
        BrandStrategy brandStrategy = repo.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new NoSuchElementException("삭제할 브랜딩 전략을 찾을 수 없거나 권한이 없습니다."));

        // 1. 프로젝트와의 연결 고리 먼저 끊기
        repo.deleteProjectRelation(id);

        // 2. 이제 삭제 (에러 안 남)
        repo.delete(brandStrategy);
    }
}