package com.spilltea.repository;

import com.spilltea.entity.Letter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LetterRepository extends JpaRepository<Letter, Long> {

    List<Letter> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    Page<Letter> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);

    List<Letter> findByIsPrivateFalseOrderByCreatedAtDesc();

    Optional<Letter> findByIdAndAuthorId(Long id, Long authorId);

    long countByAuthorId(Long authorId);
}
