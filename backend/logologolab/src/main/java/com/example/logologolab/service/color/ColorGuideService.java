package com.example.logologolab.service.color;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.color.*;
import com.example.logologolab.repository.color.ColorGuideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ColorGuideService {

    private final ColorGuideRepository repo;

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
        ColorGuide e = ColorGuide.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .projectId(req.projectId())
                .createdBy(createdBy)
                .mainHex(normHex(g.main().hex())).mainDesc(g.main().description())
                .subHex(normHex(g.sub().hex())).subDesc(g.sub().description())
                .pointHex(normHex(g.point().hex())).pointDesc(g.point().description())
                .backgroundHex(normHex(g.background().hex())).backgroundDesc(g.background().description())
                .build();

        e = repo.save(e);

        return new ColorGuideResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getProjectId(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedAt(),
                new ColorGuideDTO(
                        new ColorGuideDTO.Role(e.getMainHex(), e.getMainDesc()),
                        new ColorGuideDTO.Role(e.getSubHex(), e.getSubDesc()),
                        new ColorGuideDTO.Role(e.getPointHex(), e.getPointDesc()),
                        new ColorGuideDTO.Role(e.getBackgroundHex(), e.getBackgroundDesc())
                )
        );
    }

    @Transactional(readOnly = true)
    public ColorGuideResponse get(Long id) {
        var e = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("not found: " + id));
        return new ColorGuideResponse(
                e.getId(), e.getBriefKo(), e.getStyle(), e.getCaseType(), e.getSourceImage(),
                e.getProjectId(), e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedAt(),
                new ColorGuideDTO(
                        new ColorGuideDTO.Role(e.getMainHex(), e.getMainDesc()),
                        new ColorGuideDTO.Role(e.getSubHex(), e.getSubDesc()),
                        new ColorGuideDTO.Role(e.getPointHex(), e.getPointDesc()),
                        new ColorGuideDTO.Role(e.getBackgroundHex(), e.getBackgroundDesc())
                )
        );
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listByProject(Long projectId, Pageable pageable) {
        return repo.findByProjectId(projectId, pageable)
                .map(e -> new ColorGuideListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getMainHex(), e.getPointHex(), e.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<ColorGuideListItem> listMine(String createdBy, Pageable pageable) {
        return repo.findByCreatedBy(createdBy, pageable)
                .map(e -> new ColorGuideListItem(e.getId(), e.getBriefKo(), e.getStyle(), e.getMainHex(), e.getPointHex(), e.getCreatedAt()));
    }
}
