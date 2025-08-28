package com.example.logologolab.repository.brand;

import com.example.logologolab.domain.BrandStrategy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandStrategyRepository extends JpaRepository<BrandStrategy, Long> {
    Page<BrandStrategy> findByCreatedBy(String createdBy, Pageable pageable);
    Page<BrandStrategy> findByProjectId(Long projectId, Pageable pageable);
}