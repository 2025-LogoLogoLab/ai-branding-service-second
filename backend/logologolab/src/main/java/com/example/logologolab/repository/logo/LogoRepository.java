package com.example.logologolab.repository.logo;

import com.example.logologolab.domain.Logo;
import com.example.logologolab.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LogoRepository extends JpaRepository<Logo, Long> {
    List<Logo> findByProjectId(Long projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Logo l set l.project = null where l.project.id = :projectId")
    int detachAllByProjectId(@Param("projectId") Long projectId);

    Optional<Logo> findByIdAndCreatedBy(Long id, User createdBy);
    Page<Logo> findByCreatedBy(User createdBy, Pageable pageable);
}