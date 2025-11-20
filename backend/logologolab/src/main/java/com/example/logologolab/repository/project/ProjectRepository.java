package com.example.logologolab.repository.project;

import com.example.logologolab.domain.Project;
import com.example.logologolab.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByIdAndUser(Long id, User user);

    // logos만 fetch join (다른 bag 컬렉션은 X) → MultipleBagFetchException 회피
    @Query("""
      select distinct p
      from Project p
      left join fetch p.logos
      where p.id = :id and p.user = :user
    """)
    Optional<Project> findWithLogos(@Param("id") Long id, @Param("user") User user);

    List<Project> findByUserOrderByCreatedAtDesc(User user);

    Page<Project> findByUser(User user, Pageable pageable);
}
