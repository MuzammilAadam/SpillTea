package com.spilltea.repository;

import com.spilltea.entity.Reaction;
import com.spilltea.entity.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    Optional<Reaction> findByStoryIdAndUserIdAndReactionType(Long storyId, Long userId, ReactionType reactionType);

    List<Reaction> findByStoryIdAndUserId(Long storyId, Long userId);

    @Query("SELECT r.reactionType, COUNT(r) FROM Reaction r WHERE r.story.id = :storyId GROUP BY r.reactionType")
    List<Object[]> countReactionsByStoryGrouped(@Param("storyId") Long storyId);

    long countByStoryIdAndReactionType(Long storyId, ReactionType reactionType);

    long countByStoryAuthorId(Long authorId);

    void deleteByStoryIdAndUserIdAndReactionType(Long storyId, Long userId, ReactionType reactionType);
}
