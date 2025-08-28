package com.example.logologolab.repository.logo;

import com.example.logologolab.domain.Logo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogoRepository extends JpaRepository<Logo, Long> {
}
