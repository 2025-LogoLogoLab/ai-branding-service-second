package com.example.logologolab.service.brand;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandStrategyService {

    private final BrandStrategyRepository repo;

    @Transactional
    public BrandStrategyResponse save(BrandStrategyPersistRequest req, String createdBy) {
        if (req.markdown() == null || req.markdown().isBlank())
            throw new IllegalArgumentException("markdown is required");

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        BrandStrategy e = BrandStrategy.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .markdown(req.markdown())
                .projectId(req.projectId())
                .createdBy(createdBy)
                .build();

        e = repo.save(e);

        return new BrandStrategyResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getProjectId(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedAt(), e.getMarkdown()
        );
    }

    @Transactional(readOnly = true)
    public BrandStrategyResponse get(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("not found: " + id));
        return new BrandStrategyResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getProjectId(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedAt(), e.getMarkdown()
        );
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listByProject(Long projectId, Pageable pageable) {
        return repo.findByProjectId(projectId, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<BrandStrategyListItem> listMine(String createdBy, Pageable pageable) {
        return repo.findByCreatedBy(createdBy, pageable)
                .map(e -> new BrandStrategyListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getCreatedAt()));
    }
}
