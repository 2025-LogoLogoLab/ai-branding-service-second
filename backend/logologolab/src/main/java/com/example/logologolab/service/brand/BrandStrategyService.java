package com.example.logologolab.service.brand;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.domain.User;
import com.example.logologolab.security.LoginUserProvider;

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

    @Transactional
    public BrandStrategyResponse save(BrandStrategyPersistRequest req, String createdByEmail, ProviderType createdByProvider) {
        if (req.markdown() == null || req.markdown().isBlank())
            throw new IllegalArgumentException("markdown is required");

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        User creator = userRepository.findByEmailAndProvider(createdByEmail, createdByProvider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        BrandStrategy e = BrandStrategy.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .markdown(req.markdown())
                .project(null) // 프로젝트에 연결하지 않고 저장
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

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listByProject(Long projectId, Pageable pageable) {
        return repo.findByProjectId(projectId, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listMine(String email, ProviderType provider, Pageable pageable) {
        if (email == null || email.isBlank()) return Page.empty(pageable);
        User user = userRepository.findByEmailAndProvider(email, provider)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        return repo.findByCreatedBy(user, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listPublic(Pageable pageable) {
        return repo.findAll(pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
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

        repo.delete(brandStrategy);
    }
}