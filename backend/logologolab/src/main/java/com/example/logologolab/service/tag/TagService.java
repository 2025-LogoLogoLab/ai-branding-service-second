package com.example.logologolab.service.tag;

import com.example.logologolab.domain.*;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.tag.TagRepository;
import com.example.logologolab.security.LoginUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagRepository tagRepository;
    private final LogoRepository logoRepository;
    private final ColorGuideRepository colorGuideRepository;
    private final BrandStrategyRepository brandStrategyRepository;
    private final LoginUserProvider loginUserProvider;

    // 로고에 태그 할당
    public String assignTagsToLogo(Long logoId, List<String> tagNames) {
        User user = loginUserProvider.getLoginUser();
        Logo logo = logoRepository.findByIdAndCreatedBy(logoId, user)
                .orElseThrow(() -> new NoSuchElementException("로고를 찾을 수 없거나 권한이 없습니다."));

        Set<Tag> tags = findOrCreateTags(tagNames);
        logo.setTags(tags);
        return "로고에 태그 달기가 완료되었습니다.";
    }

    // 컬러 가이드에 태그 할당
    public String assignTagsToColorGuide(Long colorGuideId, List<String> tagNames) {
        User user = loginUserProvider.getLoginUser();
        ColorGuide colorGuide = colorGuideRepository.findByIdAndCreatedBy(colorGuideId, user)
                .orElseThrow(() -> new NoSuchElementException("컬러 가이드를 찾을 수 없거나 권한이 없습니다."));

        Set<Tag> tags = findOrCreateTags(tagNames);
        colorGuide.setTags(tags);
        return "컬러 가이드에 태그 달기가 완료되었습니다.";
    }

    // 브랜딩 전략에 태그 할당
    public String assignTagsToBrandStrategy(Long brandStrategyId, List<String> tagNames) {
        User user = loginUserProvider.getLoginUser();
        BrandStrategy brandStrategy = brandStrategyRepository.findByIdAndCreatedBy(brandStrategyId, user)
                .orElseThrow(() -> new NoSuchElementException("브랜딩 전략을 찾을 수 없거나 권한이 없습니다."));

        Set<Tag> tags = findOrCreateTags(tagNames);
        brandStrategy.setTags(tags);
        return "브랜딩 전략에 태그 달기가 완료되었습니다.";
    }

    /**
     * 태그 이름 목록을 받아, DB에서 찾거나 새로 생성하여 Tag 엔티티 Set을 반환하는 핵심 메소드
     */
    private Set<Tag> findOrCreateTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        // 1. 이미 존재하는 태그들을 한 번에 조회
        List<Tag> existingTags = tagRepository.findByNameIn(tagNames);
        Set<String> existingTagNames = existingTags.stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        // 2. 존재하지 않는 태그 이름들을 필터링
        List<Tag> newTags = tagNames.stream()
                .filter(name -> !existingTagNames.contains(name))
                .map(Tag::new)
                .collect(Collectors.toList());

        // 3. 새로운 태그들을 DB에 저장
        tagRepository.saveAll(newTags);

        // 4. 기존 태그와 새로 생성된 태그를 합쳐서 반환
        Set<Tag> allTags = new HashSet<>(existingTags);
        allTags.addAll(newTags);
        return allTags;
    }
}