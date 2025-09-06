package com.example.logologolab.repository.logo;

import com.example.logologolab.domain.Logo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogoRepository extends JpaRepository<Logo, Long> {
    List<Logo> findByProjectId(Long projectId);
}