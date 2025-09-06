package com.example.logologolab.repository.color;

import com.example.logologolab.domain.ColorGuide;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface ColorGuideRepository extends JpaRepository<ColorGuide, Long> {
    Page<ColorGuide> findByCreatedBy(String createdBy, Pageable pageable);
    Page<ColorGuide> findByProjectId(Long projectId, Pageable pageable);
    List<ColorGuide> findByProjectId(Long projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update ColorGuide c set c.project = null where c.project.id = :projectId")
    int detachAllByProjectId(@Param("projectId") Long projectId);
}