package com.example.logologolab.repository.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LogoRepository extends JpaRepository<Logo, Long> {

    Optional<Logo> findByIdAndCreatedBy(Long id, User createdBy);
    Page<Logo> findByCreatedBy(User createdBy, Pageable pageable);

    List<Logo> findAllByCreatedBy(User user);
    List<Logo> findByTags_NameAndCreatedBy(String tagName, User user);

    @Query("SELECT l FROM Project p JOIN p.logos l WHERE p.id = :projectId")
    Page<Logo> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Modifying
    @Query(value = "DELETE FROM project_logo WHERE logo_id = :id", nativeQuery = true)
    void deleteProjectRelation(@Param("id") Long id);
}