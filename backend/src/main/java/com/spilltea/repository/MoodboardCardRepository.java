package com.spilltea.repository;

import com.spilltea.entity.MoodboardCard;
import com.spilltea.entity.enums.CardScope;
import com.spilltea.entity.enums.CardVisibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoodboardCardRepository extends JpaRepository<MoodboardCard, Long> {

    List<MoodboardCard> findByMoodboardIdAndScopeOrderByDisplayOrderAsc(Long moodboardId, CardScope scope);

    List<MoodboardCard> findByMoodboardIdAndScopeAndVisibilityOrderByDisplayOrderAsc(
            Long moodboardId, CardScope scope, CardVisibility visibility);

    void deleteByMoodboardIdAndScope(Long moodboardId, CardScope scope);
}
