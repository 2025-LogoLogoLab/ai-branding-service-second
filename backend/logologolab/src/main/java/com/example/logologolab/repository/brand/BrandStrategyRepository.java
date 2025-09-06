package com.example.logologolab.repository.brand;

import com.example.logologolab.domain.BrandStrategy;
import com.example.logologolab.domain.User;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BrandStrategyRepository extends JpaRepository<BrandStrategy, Long> {
    Page<BrandStrategy> findByCreatedBy(User createdBy, Pageable pageable); // ← 수정
    Page<BrandStrategy> findByProjectId(Long projectId, Pageable pageable);
    List<BrandStrategy> findByProjectId(Long projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update BrandStrategy b set b.project = null where b.project.id = :projectId")
    int detachAllByProjectId(@org.springframework.data.repository.query.Param("projectId") Long projectId);
}
