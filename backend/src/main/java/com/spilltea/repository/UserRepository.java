package com.spilltea.repository;

import com.spilltea.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.spilltea.entity.enums.AccountStatus;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPseudonym(String pseudonym);
    boolean existsByEmail(String email);
    boolean existsByPseudonym(String pseudonym);

    @Query("select u from User u where u.status = :status and (lower(u.pseudonym) like lower(concat('%', :query, '%')) or lower(u.displayName) like lower(concat('%', :query, '%'))) and (:viewerId is null or (u.id <> :viewerId and not exists (select b.id from BlockedUser b where (b.blocker.id = :viewerId and b.blocked.id = u.id) or (b.blocker.id = u.id and b.blocked.id = :viewerId)))) order by u.pseudonym asc")
    Page<User> searchPublicUsers(@Param("query") String query, @Param("viewerId") Long viewerId,
                                 @Param("status") AccountStatus status, Pageable pageable);
}
