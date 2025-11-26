package com.example.logologolab.repository.project;

import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByIdAndUser(Long id, User user);

    // logos만 fetch join (다른 bag 컬렉션은 X) → MultipleBagFetchException 회피
    @Query("""
      select distinct p
      from Project p
      left join fetch p.logos
      where p.id = :id and p.user = :user
    """)
    Optional<Project> findWithLogos(@Param("id") Long id, @Param("user") User user);

    List<Project> findByUserOrderByCreatedAtDesc(User user);

    Page<Project> findByUser(User user, Pageable pageable);

    // 상세 조회용: 자산들을 다 함께 가져옴
    @Query("SELECT distinct p FROM Project p " +
            "LEFT JOIN FETCH p.brandStrategies " +
            "LEFT JOIN FETCH p.colorGuides " +
            "LEFT JOIN FETCH p.logos " +
            "WHERE p.id = :id AND p.user = :user")
    Optional<Project> findWithAssets(@Param("id") Long id, @Param("user") User user);

    // 관리자용: 소유자(User) 조건 없이 ID로만 조회 + Fetch Join
    @Query("SELECT distinct p FROM Project p " +
            "LEFT JOIN FETCH p.brandStrategies " +
            "LEFT JOIN FETCH p.colorGuides " +
            "LEFT JOIN FETCH p.logos " +
            "WHERE p.id = :id")
    Optional<Project> findByIdWithAssets(@Param("id") Long id);

    // 특정 브랜딩 전략을 포함하고 있는 프로젝트들 찾기
    @Query("SELECT p FROM Project p JOIN p.brandStrategies b WHERE b.id = :id")
    List<Project> findAllByBrandStrategyId(@Param("id") Long brandStrategyId);

    // 컬러 가이드용
    @Query("SELECT p FROM Project p JOIN p.colorGuides c WHERE c.id = :id")
    List<Project> findAllByColorGuideId(@Param("id") Long colorGuideId);

    // 로고용
    @Query("SELECT p FROM Project p JOIN p.logos l WHERE l.id = :id")
    List<Project> findAllByLogoId(@Param("id") Long logoId);
}
