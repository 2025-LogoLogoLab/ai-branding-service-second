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

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final LoginUserProvider loginUserProvider;
    private final BrandStrategyRepository brandStrategyRepository;
    private final ColorGuideRepository colorGuideRepository;
    private final LogoRepository logoRepository;
    private final jakarta.persistence.EntityManager em;

    @Transactional
    public ProjectResponse createProject(ProjectRequest req) {
        User user = loginUserProvider.getLoginUser();

        Project saved = projectRepository.save(
                Project.builder().name(req.getName()).user(user).build()
        );

        linkAssetsToProject(saved.getId(), req, user);

        em.flush();

        Project p = projectRepository.findWithLogos(saved.getId(), user).orElseThrow();
        var bsList = brandStrategyRepository.findByProjectId(saved.getId());
        var cgList = colorGuideRepository.findByProjectId(saved.getId());
        return ProjectResponse.of(p, bsList, cgList, p.getLogos());
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest req) {
        User user = loginUserProvider.getLoginUser();

        // 존재/소유자 확인
        projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        // 이름 수정 + 링크 재설정
        Project ref = projectRepository.getReferenceById(projectId);
        ref.setName(req.getName());
        linkAssetsToProject(projectId, req, user);

        em.flush();

        // 재조회 + 연관 자원 병합
        Project p = projectRepository.findWithLogos(projectId, user).orElseThrow();
        var bsList = brandStrategyRepository.findByProjectId(projectId);
        var cgList = colorGuideRepository.findByProjectId(projectId);
        return ProjectResponse.of(p, bsList, cgList, p.getLogos());
    }

    @Transactional
    public void deleteProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();

        // 존재/권한 확인 (예외 던져 UX 선명화)
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        // 1) 모든 연관 해제 (project_id -> null)
        brandStrategyRepository.detachAllByProjectId(projectId);
        colorGuideRepository.detachAllByProjectId(projectId);
        logoRepository.detachAllByProjectId(projectId);

        // 2) 부모 삭제
        projectRepository.delete(project);
        // 선택: 즉시 DB 반영/정합성 보장
        // entityManager.flush();
    }


    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();
        Project p = projectRepository.findWithLogos(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        var bsList = brandStrategyRepository.findByProjectId(projectId);
        var cgList = colorGuideRepository.findByProjectId(projectId);
        // logos는 p.getLogos()에 이미 들어있음

        return ProjectResponse.of(p, bsList, cgList, p.getLogos());
    }

    @Transactional
    public void linkAssetsToProject(Long projectId, ProjectRequest req, User user) {
        Project ref = projectRepository.getReferenceById(projectId);

        // 1) 기존 연결 해제 (이 프로젝트에 묶인 것만)
        colorGuideRepository.findByProjectId(projectId)
                .forEach(cg -> cg.setProject(null));
        brandStrategyRepository.findByProjectId(projectId)
                .forEach(bs -> bs.setProject(null));
        logoRepository.findByProjectId(projectId)
                .forEach(lg -> lg.setProject(null));

        // 2) 요청 값 안전 처리
        List<Long> bsIds = req.getBrandStrategyIds() == null ? List.of() : req.getBrandStrategyIds();
        List<Long> cgIds = req.getColorGuideIds() == null ? List.of() : req.getColorGuideIds();
        List<Long> lgIds = req.getLogoIds() == null ? List.of() : req.getLogoIds();

        for (Long id : bsIds) {
            brandStrategyRepository.findById(id).ifPresent(bs -> {
                boolean ok = isOwner(bs.getCreatedBy(), user);
                if (ok) bs.setProject(ref);
                logLink("BS", id, ok, bs.getCreatedBy(), user);
            });
        }
        for (Long id : cgIds) {
            colorGuideRepository.findById(id).ifPresent(cg -> {
                boolean ok = isOwner(cg.getCreatedBy(), user);
                if (ok) cg.setProject(ref);
                logLink("CG", id, ok, cg.getCreatedBy(), user);
            });
        }
        for (Long id : lgIds) {
            logoRepository.findById(id).ifPresent(lg -> {
                boolean ok = isOwner(lg.getCreatedBy(), user);
                if (ok) lg.setProject(ref);
                logLink("LG", id, ok, lg.getCreatedBy(), user);
            });
        }

        // 4) 변경 감지 반영을 즉시 보장하고 싶으면 주석 해제
        // projectRepository.flush();
    }

    private boolean isOwner(User createdBy, User user) {
        return createdBy != null
                && user != null
                && createdBy.getId() != null
                && createdBy.getId().equals(user.getId());
    }

    private void logLink(String type, Long id, boolean ok, User owner, User user) {
        Long ownerId = owner == null ? null : owner.getId();
        Long userId  = user  == null ? null : user.getId();
        System.out.printf("[LINK-%s] id=%d ownerId=%s userId=%s -> %s%n",
                type, id, ownerId, userId, ok ? "LINKED" : "SKIPPED");
    }
}