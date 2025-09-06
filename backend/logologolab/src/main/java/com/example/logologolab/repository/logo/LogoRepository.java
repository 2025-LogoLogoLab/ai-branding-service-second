package com.example.logologolab.repository.logo;

import com.example.logologolab.domain.Logo;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LogoRepository extends JpaRepository<Logo, Long> {
    List<Logo> findByProjectId(Long projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Logo l set l.project = null where l.project.id = :projectId")
    int detachAllByProjectId(@Param("projectId") Long projectId);
}