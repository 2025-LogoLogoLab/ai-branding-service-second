package com.example.logologolab.service.admin;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.project.ProjectListItem;
import com.example.logologolab.dto.project.ProjectRequest;
import com.example.logologolab.dto.project.ProjectResponse;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.repository.user.UserRepository;
import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType; // ProviderType import 확인

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AdminProjectService {

    private final ProjectRepository projectRepository;
    private final BrandStrategyRepository brandStrategyRepository;
    private final ColorGuideRepository colorGuideRepository;
    private final LogoRepository logoRepository;
    private final UserRepository userRepository;
    private final jakarta.persistence.EntityManager em;

    // 1. [관리자] 프로젝트 생성 (관리자 명의로 생성)
    @Transactional
    public ProjectResponse createProject(ProjectRequest req, String adminEmail, ProviderType provider) {
        User adminUser = userRepository.findByEmailAndProvider(adminEmail, provider)
                .orElseThrow(() -> new NoSuchElementException("관리자 정보를 찾을 수 없습니다."));

        Project project = Project.builder()
                .name(req.getName())
                .user(adminUser)
                .build();

        projectRepository.save(project);

        // 관리자는 소유권 상관없이 연결 가능하도록 처리
        linkAssetsAny(project.getId(), req);

        em.flush();
        em.clear();

        Project saved = projectRepository.findByIdWithAssets(project.getId()).orElseThrow();
        return toResponse(saved);
    }

    // 2. [관리자] 전체 프로젝트 리스트 조회
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        // N+1 방지를 위해 application.yml에 default_batch_fetch_size 설정 필수
        return projectRepository.findAll(pageable)
                .map(this::toResponse);
    }

    // 3. [관리자] 프로젝트 상세 조회
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        Project p = projectRepository.findByIdWithAssets(projectId)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없습니다. ID: " + projectId));
        return toResponse(p);
    }

    // 4. [관리자] 프로젝트 수정
    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest req) {
        // 소유자 체크 없이 ID로 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없습니다. ID: " + projectId));

        project.setName(req.getName());

        // 자산 연결 재설정 (강제 연결)
        linkAssetsAny(projectId, req);

        em.flush();
        em.clear();

        Project updated = projectRepository.findByIdWithAssets(projectId).orElseThrow();
        return toResponse(updated);
    }

    // 5. [관리자] 프로젝트 삭제
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없습니다. ID: " + projectId));

        // N:M 관계이므로 Project 삭제 시 연결 테이블 데이터 자동 삭제됨
        projectRepository.delete(project);
    }

    // [Helper] 관리자용 에셋 연결 (소유권 체크 없음)
    private void linkAssetsAny(Long projectId, ProjectRequest req) {
        Project project = projectRepository.getReferenceById(projectId);

        // 1. 기존 연결 초기화
        project.getBrandStrategies().clear();
        project.getColorGuides().clear();
        project.getLogos().clear();

        // 2. ID로 조회하여 무조건 연결 (소유자 체크 로직 제거됨)
        if (req.getBrandStrategyIds() != null && !req.getBrandStrategyIds().isEmpty()) {
            List<BrandStrategy> list = brandStrategyRepository.findAllById(req.getBrandStrategyIds());
            project.getBrandStrategies().addAll(list);
        }

        if (req.getColorGuideIds() != null && !req.getColorGuideIds().isEmpty()) {
            List<ColorGuide> list = colorGuideRepository.findAllById(req.getColorGuideIds());
            project.getColorGuides().addAll(list);
        }

        if (req.getLogoIds() != null && !req.getLogoIds().isEmpty()) {
            List<Logo> list = logoRepository.findAllById(req.getLogoIds());
            project.getLogos().addAll(list);
        }
    }

    // [Helper] 응답 변환
    private ProjectResponse toResponse(Project p) {
        return ProjectResponse.of(
                p,
                new ArrayList<>(p.getBrandStrategies()),
                new ArrayList<>(p.getColorGuides()),
                new ArrayList<>(p.getLogos())
        );
    }
}