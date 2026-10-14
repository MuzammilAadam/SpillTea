package com.spilltea.service;

import com.spilltea.dto.profile.*;
import com.spilltea.entity.Follow;
import com.spilltea.entity.User;
import com.spilltea.entity.enums.NotificationType;
import com.spilltea.entity.enums.AccountStatus;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.repository.BlockedUserRepository;
import com.spilltea.repository.FollowRepository;
import com.spilltea.repository.StoryRepository;
import com.spilltea.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KindredService {
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final StoryRepository storyRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final NotificationService notificationService;

    public KindredService(UserRepository userRepository, FollowRepository followRepository, StoryRepository storyRepository,
                          BlockedUserRepository blockedUserRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.storyRepository = storyRepository;
        this.blockedUserRepository = blockedUserRepository;
        this.notificationService = notificationService;
    }

    public KindredStatsResponse stats(Long userId) {
        requireUser(userId);
        return new KindredStatsResponse(
                storyRepository.countByAuthorIdAndStatus(userId, com.spilltea.entity.enums.PublicationStatus.PUBLISHED),
                followRepository.countByFollowedId(userId), followRepository.countByFollowerId(userId));
    }

    @Transactional
    public KindredStatsResponse follow(Long followerId, Long followedId) {
        if (followerId.equals(followedId)) throw new BadRequestException("You cannot follow yourself.");
        User follower = requireUser(followerId);
        User followed = requireUser(followedId);
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(followerId, followedId)
                || blockedUserRepository.existsByBlockerIdAndBlockedId(followedId, followerId)) {
            throw new BadRequestException("This relationship is unavailable.");
        }
        if (!followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
            try {
                followRepository.saveAndFlush(new Follow(follower, followed));
                notificationService.createNotification(followed, follower, NotificationType.FOLLOW,
                        follower.getPseudonym() + " found their way to your little corner.",
                        "You have a new Kindred connection.", null, null, null);
            } catch (DataIntegrityViolationException ignored) {
                // A concurrent duplicate request is already represented by the unique constraint.
            }
        }
        return stats(followedId);
    }

    @Transactional
    public KindredStatsResponse unfollow(Long followerId, Long followedId) {
        if (followerId.equals(followedId)) throw new BadRequestException("You cannot unfollow yourself.");
        requireUser(followerId); requireUser(followedId);
        followRepository.deleteByFollowerIdAndFollowedId(followerId, followedId);
        return stats(followedId);
    }

    public RelationshipResponse relationship(Long viewerId, Long profileId) {
        requireUser(profileId);
        if (viewerId == null || viewerId.equals(profileId)) return new RelationshipResponse(false, false);
        boolean following = followRepository.existsByFollowerIdAndFollowedId(viewerId, profileId);
        boolean mutual = following && followRepository.existsByFollowerIdAndFollowedId(profileId, viewerId);
        return new RelationshipResponse(following, mutual);
    }

    public KindredPageResponse list(Long profileId, boolean following, Long viewerId, int page, int size) {
        requireUser(profileId);
        PageRequest request = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        Page<User> users = following ? followRepository.findFollowedUsers(profileId, request) : followRepository.findFollowerUsers(profileId, request);
        return toPage(users, viewerId);
    }

    public org.springframework.data.domain.Page<PeopleSearchResponse> search(String query, Long viewerId, int page, int size) {
        Page<User> users = userRepository.searchPublicUsers(query.trim(), viewerId, AccountStatus.ACTIVE,
                PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50)));
        return users.map(user -> {
            RelationshipResponse relation = relationship(viewerId, user.getId());
            return new PeopleSearchResponse(user.getId().toString(), user.getPseudonym(), user.getDisplayName(), user.getBio(), user.getAvatar(),
                    followRepository.countByFollowedId(user.getId()), relation.following(), relation.mutualKindred());
        });
    }

    @Transactional
    public void removeConnectionForBlock(Long firstId, Long secondId) {
        followRepository.deleteByFollowerIdAndFollowedIdOrFollowerIdAndFollowedId(firstId, secondId, secondId, firstId);
    }

    private KindredPageResponse toPage(Page<User> page, Long viewerId) {
        return new KindredPageResponse(page.getContent().stream().map(user -> {
            RelationshipResponse relation = relationship(viewerId, user.getId());
            return new KindredProfileResponse(user.getId().toString(), user.getPseudonym(), user.getDisplayName(), user.getBio(), user.getAvatar(), relation.following(), relation.mutualKindred());
        }).toList(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    private User requireUser(Long id) { return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
}
