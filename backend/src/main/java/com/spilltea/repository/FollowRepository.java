package com.spilltea.repository;

import com.spilltea.entity.Follow;
import com.spilltea.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowedId(Long followerId, Long followedId);
    long countByFollowedId(Long followedId);
    long countByFollowerId(Long followerId);
    void deleteByFollowerIdAndFollowedId(Long followerId, Long followedId);
    void deleteByFollowerIdAndFollowedIdOrFollowerIdAndFollowedId(Long followerId, Long followedId, Long reverseFollowerId, Long reverseFollowedId);

    @Query("select f.followed from Follow f where f.follower.id = :userId and not exists (select b.id from BlockedUser b where (b.blocker.id = :userId and b.blocked.id = f.followed.id) or (b.blocker.id = f.followed.id and b.blocked.id = :userId))")
    Page<User> findFollowedUsers(@Param("userId") Long userId, Pageable pageable);

    @Query("select f.follower from Follow f where f.followed.id = :userId and not exists (select b.id from BlockedUser b where (b.blocker.id = :userId and b.blocked.id = f.follower.id) or (b.blocker.id = f.follower.id and b.blocked.id = :userId))")
    Page<User> findFollowerUsers(@Param("userId") Long userId, Pageable pageable);
}
