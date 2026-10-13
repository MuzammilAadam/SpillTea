package com.spilltea.repository;

import com.spilltea.entity.Story;
import com.spilltea.entity.enums.PublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    Optional<Story> findByIdAndStatus(Long id, PublicationStatus status);

    @Query("SELECT s FROM Story s WHERE s.status = :status AND " +
           "(:category IS NULL OR :category = 'All' OR LOWER(s.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.body) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Story> findPublishedStories(
            @Param("status") PublicationStatus status,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable
    );

    List<Story> findByAuthorIdAndStatus(Long authorId, PublicationStatus status);

    List<Story> findByAuthorId(Long authorId);

    List<Story> findByAuthorIdAndStatusOrderByUpdatedAtDesc(Long authorId, PublicationStatus status);

    long countByAuthorIdAndStatus(Long authorId, PublicationStatus status);
}
