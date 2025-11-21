package com.example.logologolab.service.admin;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.color.*;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.tag.TagRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.service.gpt.GptPromptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminColorService {

    private final ColorGuideRepository colorGuideRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final GptPromptService gptPromptService;

    // Hex 정규화 헬퍼
    private static String normHex(String hex) {
        if (hex == null) return null;
        String s = hex.trim().toUpperCase();
        if (!s.startsWith("#")) s = "#" + s;
        return s.matches("^#[0-9A-F]{6}$") ? s : null;
    }

    // 1. [관리자] 컬러 가이드 생성 (GPT 호출)
    public ColorGuideDTO generateColorGuide(ColorGuideRequest req) {
        String style = req.style() == null ? "minimal" : req.style();
        String img = null;
        if (req.base64() != null && req.base64().startsWith("data:")) img = req.base64();
        else if (req.imageUrl() != null && !req.imageUrl().isBlank()) img = req.imageUrl();

        if (img != null) {
            return gptPromptService.generateColorGuideFromImage(req.briefKo(), style, img);
        } else {
            return gptPromptService.generateColorGuideTextOnly(req.briefKo(), style);
        }
    }

    // 2. [관리자] 컬러 가이드 저장
    @Transactional
    public ColorGuideResponse saveColorGuide(ColorGuidePersistRequest req, String adminEmail, ProviderType provider) {
        if (req.guide() == null) throw new IllegalArgumentException("guide data is required");

        User creator = userRepository.findByEmailAndProvider(adminEmail, provider)
                .orElseThrow(() -> new NoSuchElementException("관리자 정보를 찾을 수 없습니다."));

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;
        var g = req.guide();

        ColorGuide e = ColorGuide.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .createdBy(creator)
                .mainHex(normHex(g.main().hex())).mainDesc(g.main().description())
                .subHex(normHex(g.sub().hex())).subDesc(g.sub().description())
                .pointHex(normHex(g.point().hex())).pointDesc(g.point().description())
                .backgroundHex(normHex(g.background().hex())).backgroundDesc(g.background().description())
                .build();

        return ColorGuideResponse.from(colorGuideRepository.save(e));
    }

    // 3. [관리자] 전체 리스트 조회 (소유자 구분 X)
    public Page<ColorGuideListItem> getAllColorGuides(Pageable pageable) {
        return colorGuideRepository.findAll(pageable)
                .map(e -> new ColorGuideListItem(
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
                ));
    }

    // 4. [관리자] 상세 조회
    public ColorGuideResponse getColorGuideDetail(Long id) {
        ColorGuide e = colorGuideRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없습니다. ID: " + id));
        return ColorGuideResponse.from(e);
    }

    // 5. [관리자] 수정 (내용 업데이트)
    @Transactional
    public ColorGuideResponse updateColorGuide(Long id, ColorGuideUpdateRequest req) {
        ColorGuide e = colorGuideRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없습니다. ID: " + id));

        ColorGuideDTO g = req.guide();
        e.updateGuide(
                normHex(g.main().hex()), g.main().description(),
                normHex(g.sub().hex()), g.sub().description(),
                normHex(g.point().hex()), g.point().description(),
                normHex(g.background().hex()), g.background().description()
        );
        return ColorGuideResponse.from(e);
    }

    // 6. [관리자] 삭제
    @Transactional
    public void deleteColorGuideAny(Long id) {
        ColorGuide e = colorGuideRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없습니다. ID: " + id));
        colorGuideRepository.delete(e);
    }

    // 7. [관리자] 태그 수정/할당
    @Transactional
    public ColorGuideResponse updateTags(Long id, List<String> tagNames) {
        ColorGuide e = colorGuideRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없습니다. ID: " + id));

        Set<Tag> tags = findOrCreateTags(tagNames);
        e.setTags(tags);

        return ColorGuideResponse.from(e);
    }

    // 내부 헬퍼: 태그 생성 로직 (AdminLogoService와 동일)
    private Set<Tag> findOrCreateTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) return new HashSet<>();

        List<Tag> existingTags = tagRepository.findByNameIn(tagNames);
        Set<String> existingNames = existingTags.stream().map(Tag::getName).collect(Collectors.toSet());

        List<Tag> newTags = tagNames.stream()
                .filter(name -> !existingNames.contains(name))
                .map(Tag::new)
                .collect(Collectors.toList());

        tagRepository.saveAll(newTags);

        Set<Tag> result = new HashSet<>(existingTags);
        result.addAll(newTags);
        return result;
    }
}