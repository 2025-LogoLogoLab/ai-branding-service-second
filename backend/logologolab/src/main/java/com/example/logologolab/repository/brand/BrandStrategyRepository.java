package com.example.logologolab.repository.brand;

import com.example.logologolab.domain.BrandStrategy;
import com.example.logologolab.domain.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface BrandStrategyRepository extends JpaRepository<BrandStrategy, Long> {
    Page<BrandStrategy> findByCreatedBy(User createdBy, Pageable pageable); // ← 수정

    Optional<BrandStrategy> findByIdAndCreatedBy(Long id, User createdBy);

    List<BrandStrategy> findAllByCreatedBy(User user);
    List<BrandStrategy> findByTags_NameAndCreatedBy(String tagName, User user);

    @Query("SELECT b FROM Project p JOIN p.brandStrategies b WHERE p.id = :projectId")
    Page<BrandStrategy> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Modifying
    @Query(value = "DELETE FROM project_brand_strategy WHERE brand_strategy_id = :id", nativeQuery = true)
    void deleteProjectRelation(@Param("id") Long id);
}
