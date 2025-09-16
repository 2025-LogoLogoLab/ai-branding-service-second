package com.example.logologolab.repository.project;

import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByIdAndUser(Long id, User user);
}