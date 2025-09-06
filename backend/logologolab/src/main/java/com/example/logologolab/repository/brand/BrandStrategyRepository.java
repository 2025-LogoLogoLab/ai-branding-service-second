package com.example.logologolab.repository.brand;

import com.example.logologolab.domain.BrandStrategy;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandStrategyRepository extends JpaRepository<BrandStrategy, Long> {
    Page<BrandStrategy> findByCreatedBy(String createdBy, Pageable pageable);
    Page<BrandStrategy> findByProjectId(Long projectId, Pageable pageable);
    List<BrandStrategy> findByProjectId(Long projectId);

    // BrandStrategyRepository
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update BrandStrategy b set b.project = null where b.project.id = :projectId")
    int detachAllByProjectId(@Param("projectId") Long projectId);
}