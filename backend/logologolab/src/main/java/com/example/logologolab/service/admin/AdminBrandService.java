package com.example.logologolab.service.admin;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.brand.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
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
public class AdminBrandService {

    private final BrandStrategyRepository brandStrategyRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final GptPromptService gptPromptService;

    // 1. [관리자] 브랜딩 전략 생성 (GPT 호출)
    public String generateBrandStrategy(BrandStrategyRequest req) {
        String style = (req.style() == null) ? "minimal" : req.style();

        String img = null;
        if (req.base64() != null && req.base64().startsWith("data:")) img = req.base64();
        else if (req.imageUrl() != null && !req.imageUrl().isBlank()) img = req.imageUrl();

        if (img != null) {
            return gptPromptService.generateBrandingStrategyFromImage(req.briefKo(), style, img);
        } else {
            return gptPromptService.generateBrandingStrategyTextOnly(req.briefKo(), style);
        }
    }

    // 2. [관리자] 브랜딩 전략 저장
    @Transactional
    public BrandStrategyResponse saveBrandStrategy(BrandStrategyPersistRequest req, String adminEmail, ProviderType provider) {
        if (req.markdown() == null || req.markdown().isBlank())
            throw new IllegalArgumentException("markdown is required");

        User creator = userRepository.findByEmailAndProvider(adminEmail, provider)
                .orElseThrow(() -> new NoSuchElementException("관리자 정보를 찾을 수 없습니다."));

        var style = Style.safeOf(req.style());
        var caseType = (req.imageUrl() != null && !req.imageUrl().isBlank())
                ? CaseType.WITH_LOGO : CaseType.WITHOUT_LOGO;

        BrandStrategy e = BrandStrategy.builder()
                .briefKo(req.briefKo())
                .style(style)
                .caseType(caseType)
                .sourceImage(req.imageUrl())
                .markdown(req.markdown())
                .createdBy(creator)
                .build();

        return BrandStrategyResponse.from(brandStrategyRepository.save(e));
    }

    // 3. [관리자] 전체 리스트 조회 (소유자 구분 X)
    public Page<BrandStrategyListItem> getAllBrandStrategies(Pageable pageable) {
        return brandStrategyRepository.findAll(pageable)
                .map(e -> new BrandStrategyListItem(
                        e.getId(),
                        e.getBriefKo(),
                        e.getStyle(),
                        e.getMarkdown(),
                        e.getCreatedAt()
                ));
    }

    // 4. [관리자] 상세 조회
    public BrandStrategyResponse getBrandStrategyDetail(Long id) {
        BrandStrategy e = brandStrategyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다. ID: " + id));
        return BrandStrategyResponse.from(e);
    }

    // 5. [관리자] 수정 (내용 업데이트)
    @Transactional
    public BrandStrategyResponse updateBrandStrategy(Long id, BrandStrategyUpdateRequest req) {
        BrandStrategy e = brandStrategyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다. ID: " + id));

        e.updateMarkdown(req.markdown());
        return BrandStrategyResponse.from(e);
    }

    // 6. [관리자] 삭제
    @Transactional
    public void deleteBrandStrategyAny(Long id) {
        BrandStrategy e = brandStrategyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다. ID: " + id));
        brandStrategyRepository.delete(e);
    }

    // 7. [관리자] 태그 수정/할당
    @Transactional
    public BrandStrategyResponse updateTags(Long id, List<String> tagNames) {
        BrandStrategy e = brandStrategyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없습니다. ID: " + id));

        Set<Tag> tags = findOrCreateTags(tagNames);
        e.setTags(tags);

        return BrandStrategyResponse.from(e);
    }

    // 내부 헬퍼: 태그 생성 로직 (다른 Admin 서비스들과 동일)
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