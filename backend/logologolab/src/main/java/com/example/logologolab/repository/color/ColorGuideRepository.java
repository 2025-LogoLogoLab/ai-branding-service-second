package com.example.logologolab.repository.color;

import com.example.logologolab.domain.ColorGuide;
import com.example.logologolab.domain.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.*;

public interface ColorGuideRepository extends JpaRepository<ColorGuide, Long> {
    // 수정: User 엔티티로 받기
    Page<ColorGuide> findByCreatedBy(User createdBy, Pageable pageable);

    Optional<ColorGuide> findByIdAndCreatedBy(Long id, User createdBy);

    List<ColorGuide> findAllByCreatedBy(User user);
    List<ColorGuide> findByTags_NameAndCreatedBy(String tagName, User user);

    @Query("SELECT c FROM Project p JOIN p.colorGuides c WHERE p.id = :projectId")
    Page<ColorGuide> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Modifying
    @Query(value = "DELETE FROM project_color_guide WHERE color_guide_id = :id", nativeQuery = true)
    void deleteProjectRelation(@Param("id") Long id);
}