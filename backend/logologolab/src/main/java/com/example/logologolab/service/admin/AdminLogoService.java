package com.example.logologolab.service.admin;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.Tag;
import com.example.logologolab.domain.User;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.logo.LogoResponse;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.tag.TagRepository;
import com.example.logologolab.service.s3.S3UploadService;
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
public class AdminLogoService {

    private final LogoRepository logoRepository;
    private final TagRepository tagRepository;
    private final S3UploadService s3UploadService;

    // 1. 전체 로고 리스트 조회 (소유자 구분 없음)
    public Page<LogoListItem> getAllLogos(Pageable pageable) {
        return logoRepository.findAll(pageable)
                .map(logo -> new LogoListItem(
                        logo.getId(),
                        logo.getPrompt(),
                        logo.getImageUrl(),
                        logo.getCreatedAt()
                ));
    }

    // 2. 로고 상세 조회 (소유자 체크 X)
    public LogoResponse getLogoDetail(Long id) {
        Logo logo = logoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 로고를 찾을 수 없습니다. ID: " + id));
        return LogoResponse.from(logo);
    }

    // 3. 로고 삭제 (S3 이미지 + DB 데이터)
    @Transactional
    public void deleteLogoAny(Long id) {
        Logo logo = logoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 로고를 찾을 수 없습니다. ID: " + id));

        // S3 삭제
        s3UploadService.deleteObjectByUrl(logo.getImageUrl());
        // DB 삭제
        logoRepository.delete(logo);
    }

    // 4. [관리자] 태그 수정/할당
    @Transactional
    public LogoResponse updateLogoTags(Long id, List<String> tagNames) {
        Logo logo = logoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 로고를 찾을 수 없습니다. ID: " + id));

        // 태그 조회 및 생성 로직 (TagService 로직과 동일하게 구현)
        Set<Tag> tags = findOrCreateTags(tagNames);

        // 태그 교체
        logo.setTags(tags);

        return LogoResponse.from(logo);
    }

    // 내부 헬퍼: 태그 이름 목록으로 Tag 엔티티 Set 반환
    private Set<Tag> findOrCreateTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        // 1. 기존 태그 조회
        List<Tag> existingTags = tagRepository.findByNameIn(tagNames);
        Set<String> existingTagNames = existingTags.stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());

        // 2. 없는 태그 새로 생성
        List<Tag> newTags = tagNames.stream()
                .filter(name -> !existingTagNames.contains(name))
                .map(Tag::new)
                .collect(Collectors.toList());

        tagRepository.saveAll(newTags);

        // 3. 합치기
        Set<Tag> result = new HashSet<>(existingTags);
        result.addAll(newTags);
        return result;
    }
}