package com.spilltea.repository;

import com.spilltea.entity.Moodboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MoodboardRepository extends JpaRepository<Moodboard, Long> {
    Optional<Moodboard> findByOwnerId(Long ownerId);

    @Query("SELECT m FROM Moodboard m JOIN m.owner u WHERE u.pseudonym = :pseudonym")
    Optional<Moodboard> findByOwnerPseudonym(@Param("pseudonym") String pseudonym);
}
