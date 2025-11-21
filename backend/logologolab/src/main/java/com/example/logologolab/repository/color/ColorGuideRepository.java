package com.example.logologolab.repository.color;

import com.example.logologolab.domain.ColorGuide;
import com.example.logologolab.domain.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.*;

public interface ColorGuideRepository extends JpaRepository<ColorGuide, Long> {
    // 수정: User 엔티티로 받기
    Page<ColorGuide> findByCreatedBy(User createdBy, Pageable pageable);

    Optional<ColorGuide> findByIdAndCreatedBy(Long id, User createdBy);

    List<ColorGuide> findAllByCreatedBy(User user);
    List<ColorGuide> findByTags_NameAndCreatedBy(String tagName, User user);
}