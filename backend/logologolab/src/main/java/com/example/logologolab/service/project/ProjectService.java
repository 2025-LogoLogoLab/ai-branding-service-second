package com.example.logologolab.service.project;

import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.User;
import com.example.logologolab.dto.project.ProjectRequest;
import com.example.logologolab.dto.project.ProjectResponse;
import com.example.logologolab.exception.custom.OwnerMismatchException;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.security.LoginUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final LoginUserProvider loginUserProvider;
    private final BrandStrategyRepository brandStrategyRepository;
    private final ColorGuideRepository colorGuideRepository;
    private final LogoRepository logoRepository;

    @Transactional
    public ProjectResponse createProject(ProjectRequest req) {
        User user = loginUserProvider.getLoginUser();
        Project project = Project.builder()
                .name(req.getName())
                .user(user)
                .build();
        Project savedProject = projectRepository.save(project);

        linkAssetsToProject(savedProject.getId(), req, user);

        return ProjectResponse.from(savedProject);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest req) {
        User user = loginUserProvider.getLoginUser();
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        project.setName(req.getName());
        linkAssetsToProject(projectId, req, user);

        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();
        projectRepository.findByIdAndUser(projectId, user)
                .ifPresent(projectRepository::delete);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));
        return ProjectResponse.from(project);
    }

    private void linkAssetsToProject(Long projectId, ProjectRequest req, User user) {
        // 기존 연결을 모두 끊고 재연결하는 방식으로 구현
        // TODO: 더 효율적인 방법으로 개선 가능
        brandStrategyRepository.findByProjectId(projectId, null).forEach(bs -> bs.setProject(null));
        colorGuideRepository.findByProjectId(projectId, null).forEach(cg -> cg.setProject(null));
        logoRepository.findByProjectId(projectId).forEach(l -> l.setProject(null));

        if (req.getBrandStrategyIds() != null) {
            req.getBrandStrategyIds().forEach(id -> brandStrategyRepository.findById(id)
                    .ifPresent(bs -> {
                        if (bs.getCreatedBy().equals(user)) bs.setProject(projectRepository.getById(projectId));
                    }));
        }
        if (req.getColorGuideIds() != null) {
            req.getColorGuideIds().forEach(id -> colorGuideRepository.findById(id)
                    .ifPresent(cg -> {
                        if (cg.getCreatedBy().equals(user)) cg.setProject(projectRepository.getById(projectId));
                    }));
        }
        if (req.getLogoIds() != null) {
            req.getLogoIds().forEach(id -> logoRepository.findById(id)
                    .ifPresent(l -> {
                        if (l.getCreatedBy().equals(user)) l.setProject(projectRepository.getById(projectId));
                    }));
        }
    }
}