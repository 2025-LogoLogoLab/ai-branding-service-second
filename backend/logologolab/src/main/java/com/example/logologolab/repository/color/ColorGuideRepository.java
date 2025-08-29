package com.example.logologolab.repository.color;

import com.example.logologolab.domain.ColorGuide;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorGuideRepository extends JpaRepository<ColorGuide, Long> {
    Page<ColorGuide> findByCreatedBy(String createdBy, Pageable pageable);
    Page<ColorGuide> findByProjectId(Long projectId, Pageable pageable);
}