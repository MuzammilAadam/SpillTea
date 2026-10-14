package com.spilltea.repository;

import com.spilltea.entity.LetterReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LetterReplyRepository extends JpaRepository<LetterReply, Long> {
    List<LetterReply> findByLetterIdOrderByCreatedAtAsc(Long letterId);
    long countByLetterId(Long letterId);
}
