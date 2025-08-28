package com.example.logologolab.repository.user;

import com.example.logologolab.domain.User;
import com.example.logologolab.domain.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndProvider(String email, ProviderType provider);

    Optional<User> findByEmail(String email);
}