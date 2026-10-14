package com.spilltea.repository;

import com.spilltea.entity.LetterReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LetterReactionRepository extends JpaRepository<LetterReaction, Long> {
    Optional<LetterReaction> findByLetterIdAndUserIdAndReactionType(Long letterId, Long userId, String reactionType);
    List<LetterReaction> findByLetterId(Long letterId);
    long countByLetterId(Long letterId);
}
