package com.example.logologolab.service.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.User;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.security.LoginUserProvider;
import com.example.logologolab.dto.logo.LogoListItem;
import com.example.logologolab.dto.logo.LogoResponse;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.service.s3.S3UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LogoService {

    private final LogoRepository logoRepository;
    private final LoginUserProvider loginUserProvider;
    private final S3UploadService s3UploadService;
    private final ProjectRepository projectRepository;

    public LogoResponse getLogo(Long id) {
        Logo logo = logoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("로고를 찾을 수 없습니다."));
        return LogoResponse.from(logo);
    }

    public Page<LogoListItem> listMyLogos(Pageable pageable) {
        User user = loginUserProvider.getLoginUser();
        return logoRepository.findByCreatedBy(user, pageable)
                .map(logo -> new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt()));
    }

    public Page<LogoListItem> listPublicLogos(Pageable pageable) {
        return logoRepository.findAll(pageable)
                .map(logo -> new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt()));
    }

    public Page<LogoListItem> listByProject(Long projectId, Pageable pageable) {
        if (projectId == null) return Page.empty(pageable);
        return logoRepository.findByProjectId(projectId, pageable)
                .map(this::mapToListItem);
    }

    private LogoListItem mapToListItem(Logo logo) {
        return new LogoListItem(logo.getId(), logo.getPrompt(), logo.getImageUrl(), logo.getCreatedAt());
    }

    @Transactional
    public void deleteLogo(Long id) {
        User user = loginUserProvider.getLoginUser();
        Logo logo = logoRepository.findByIdAndCreatedBy(id, user)
                .orElseThrow(() -> new NoSuchElementException("삭제할 로고를 찾을 수 없거나 권한이 없습니다."));

        // 1. S3 이미지 삭제
        s3UploadService.deleteObjectByUrl(logo.getImageUrl());

        // 2. 이 로고를 담고 있는 모든 프로젝트를 찾음
        List<Project> projects = projectRepository.findAllByLogoId(id);

        // 3. 프로젝트들에서 해당 로고 제거 (JPA가 중간 테이블 row 삭제)
        for (Project project : projects) {
            project.getLogos().remove(logo);
        }

        // 4. DB 삭제
        logoRepository.delete(logo);
    }
}