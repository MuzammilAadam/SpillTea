package com.spilltea.repository;

import com.spilltea.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPseudonym(String pseudonym);
    boolean existsByEmail(String email);
    boolean existsByPseudonym(String pseudonym);
}
