package com.spilltea.repository;

import com.spilltea.entity.Comment;
import com.spilltea.entity.enums.CommentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c WHERE c.story.id = :storyId AND c.parent IS NULL AND c.status = :status ORDER BY c.isPinned DESC, c.createdAt ASC")
    List<Comment> findTopLevelComments(@Param("storyId") Long storyId, @Param("status") CommentStatus status);

    @Query("SELECT c FROM Comment c WHERE c.story.id = :storyId AND c.parent IS NULL AND c.status = :status ORDER BY c.isPinned DESC, c.createdAt ASC")
    Page<Comment> findTopLevelCommentsPaged(@Param("storyId") Long storyId, @Param("status") CommentStatus status, Pageable pageable);

    List<Comment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, CommentStatus status);

    long countByStoryIdAndStatus(Long storyId, CommentStatus status);
}
