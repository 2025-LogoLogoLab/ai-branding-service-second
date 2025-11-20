package com.example.logologolab.service.project;

import com.example.logologolab.domain.*;
import com.example.logologolab.dto.project.ProjectRequest;
import com.example.logologolab.dto.project.ProjectResponse;
import com.example.logologolab.repository.brand.BrandStrategyRepository;
import com.example.logologolab.repository.color.ColorGuideRepository;
import com.example.logologolab.repository.logo.LogoRepository;
import com.example.logologolab.repository.project.ProjectRepository;
import com.example.logologolab.security.LoginUserProvider;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

        Project project = Project.builder().name(req.getName()).user(user).build();
        projectRepository.save(project); // ID 생성

        linkAssetsToProject(project.getId(), req, user); // 연결

        em.flush(); // DB 반영
        em.clear(); // 영속성 컨텍스트 초기화 (중요: 깔끔하게 다시 조회하기 위함)

        Project saved = projectRepository.findWithAssets(project.getId(), user).orElseThrow();

        // 이제 별도로 repo.findByProjectId 할 필요 없이 saved에서 바로 꺼냄
        return ProjectResponse.of(
                saved,
                new ArrayList<>(saved.getBrandStrategies()),
                new ArrayList<>(saved.getColorGuides()),
                new ArrayList<>(saved.getLogos())
        );
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest req) {
        User user = loginUserProvider.getLoginUser();

        // 1. 존재 및 권한 확인
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        // 2. 이름 수정
        project.setName(req.getName());

        // 3. 연결 자산 수정 (기존 것 비우고 새로 채움)
        linkAssetsToProject(projectId, req, user);

        // 4. DB 반영 및 초기화 (중요: 1차 캐시 갱신)
        em.flush();
        em.clear();

        // 5. 재조회 (업데이트된 관계 데이터를 가져오기 위해 findWithAssets 사용)
        Project updated = projectRepository.findWithAssets(projectId, user).orElseThrow();

        // 6. 엔티티 내부의 컬렉션을 사용하여 응답 생성
        return ProjectResponse.of(
                updated,
                new ArrayList<>(updated.getBrandStrategies()),
                new ArrayList<>(updated.getColorGuides()),
                new ArrayList<>(updated.getLogos())
        );
    }

    @Transactional
    public void deleteProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();

        // 1. 존재 및 권한 확인
        Project project = projectRepository.findByIdAndUser(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        // 2. 삭제 수행
        // N:M 관계(Join Table)는 Project가 삭제되면 중간 테이블 데이터도 자동으로 삭제됩니다.
        // 자산 원본(Logo, BrandStrategy 등)은 삭제되지 않고 유지됩니다.
        projectRepository.delete(project);
    }


    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        User user = loginUserProvider.getLoginUser();

        // 페치 조인이 적용된 메서드로 한 번에 조회
        Project p = projectRepository.findWithAssets(projectId, user)
                .orElseThrow(() -> new NoSuchElementException("프로젝트를 찾을 수 없거나 접근 권한이 없습니다."));

        return ProjectResponse.of(
                p,
                new ArrayList<>(p.getBrandStrategies()),
                new ArrayList<>(p.getColorGuides()),
                new ArrayList<>(p.getLogos())
        );
    }

    @Transactional
    public void linkAssetsToProject(Long projectId, ProjectRequest req, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));

        // 1. 기존 연결 초기화 (Set을 비움)
        // N:M 관계이므로 자산 자체가 삭제되는 것이 아니라 '연결'만 끊김
        project.getBrandStrategies().clear();
        project.getColorGuides().clear();
        project.getLogos().clear();

        // 2. 요청된 ID로 자산 조회 및 연결
        List<Long> bsIds = req.getBrandStrategyIds();
        if (bsIds != null && !bsIds.isEmpty()) {
            List<BrandStrategy> strategies = brandStrategyRepository.findAllById(bsIds);
            for (BrandStrategy bs : strategies) {
                // 내 자산인지 확인 (보안)
                if (isOwner(bs.getCreatedBy(), user)) {
                    project.getBrandStrategies().add(bs);
                }
            }
        }

        List<Long> cgIds = req.getColorGuideIds();
        if (cgIds != null && !cgIds.isEmpty()) {
            List<ColorGuide> guides = colorGuideRepository.findAllById(cgIds);
            for (ColorGuide cg : guides) {
                if (isOwner(cg.getCreatedBy(), user)) {
                    project.getColorGuides().add(cg);
                }
            }
        }

        List<Long> lgIds = req.getLogoIds();
        if (lgIds != null && !lgIds.isEmpty()) {
            List<Logo> logos = logoRepository.findAllById(lgIds);
            for (Logo lg : logos) {
                if (isOwner(lg.getCreatedBy(), user)) {
                    project.getLogos().add(lg);
                }
            }
        }

        // JPA 변경 감지(Dirty Checking)에 의해 project_brand_strategy 등
        // 중간 테이블에 데이터가 자동으로 insert/delete 됩니다.
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

    @Transactional(readOnly = true)
    public Page<ProjectResponse> listMyProjects(Pageable pageable) {
        User user = loginUserProvider.getLoginUser();

        // 1. 내 프로젝트 페이징 조회
        // N+1 문제 방지를 위해 hibernate.default_batch_fetch_size 설정이 application.yml에 되어 있어야 효율적입니다.
        Page<Project> projectPage = projectRepository.findByUser(user, pageable);

        // 2. 엔티티 -> DTO 변환
        // Set을 List로 변환하여 DTO에 전달
        return projectPage.map(p -> ProjectResponse.of(
                p,
                new ArrayList<>(p.getBrandStrategies()),
                new ArrayList<>(p.getColorGuides()),
                new ArrayList<>(p.getLogos())
        ));
    }
}