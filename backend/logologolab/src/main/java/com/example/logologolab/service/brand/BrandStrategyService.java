package com.example.logologolab.service.brand;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.user.UserRepository;
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

    @Transactional
    public BrandStrategyResponse save(BrandStrategyPersistRequest req, String createdBy) {
        if (req.markdown() == null || req.markdown().isBlank())
            throw new IllegalArgumentException("markdown is required");

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        User creator = userRepository.findByEmail(createdBy)
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

        return new BrandStrategyResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getCreatedBy().getEmail(), e.getCreatedAt(), e.getUpdatedAt(), e.getMarkdown()
        );
    }

    @Transactional(readOnly = true)
    public BrandStrategyResponse get(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다."));
        return new BrandStrategyResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getCreatedBy().getEmail(), e.getCreatedAt(), e.getUpdatedAt(), e.getMarkdown()
        );
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listByProject(Long projectId, Pageable pageable) {
        return repo.findByProjectId(projectId, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listMine(String email, Pageable pageable) {
        if (email == null || email.isBlank()) return Page.empty(pageable);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        return repo.findByCreatedBy(user, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }

}