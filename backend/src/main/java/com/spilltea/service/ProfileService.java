package com.spilltea.service;

import com.spilltea.dto.moodboard.MoodboardCardDto;
import com.spilltea.dto.profile.UpdateProfileRequest;
import com.spilltea.dto.profile.UserProfileResponse;
import com.spilltea.dto.profile.KindredStatsResponse;
import com.spilltea.dto.story.StoryResponse;
import com.spilltea.entity.Moodboard;
import com.spilltea.entity.User;
import com.spilltea.entity.enums.CardScope;
import com.spilltea.entity.enums.CardVisibility;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    private static final DateTimeFormatter JOINED_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH);

    private final UserRepository userRepository;
    private final StoryService storyService;
    private final MoodboardService moodboardService;
    private final MoodboardRepository moodboardRepository;
    private final MoodboardCardRepository moodboardCardRepository;
    private final LetterService letterService;
    private final LetterRepository letterRepository;
    private final ReactionRepository reactionRepository;
    private final StorageService storageService;
    private final KindredService kindredService;
    private final BlockedUserRepository blockedUserRepository;

    public ProfileService(UserRepository userRepository, StoryService storyService,
                          MoodboardService moodboardService, MoodboardRepository moodboardRepository,
                          MoodboardCardRepository moodboardCardRepository, LetterService letterService,
                          LetterRepository letterRepository, ReactionRepository reactionRepository,
                          StorageService storageService, KindredService kindredService, BlockedUserRepository blockedUserRepository) {
        this.userRepository = userRepository;
        this.storyService = storyService;
        this.moodboardService = moodboardService;
        this.moodboardRepository = moodboardRepository;
        this.moodboardCardRepository = moodboardCardRepository;
        this.letterService = letterService;
        this.letterRepository = letterRepository;
        this.reactionRepository = reactionRepository;
        this.storageService = storageService;
        this.kindredService = kindredService;
        this.blockedUserRepository = blockedUserRepository;
    }

    public UserProfileResponse getMyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserProfileResponse dto = buildProfileResponse(user, userId);
        dto.setSelf(true);
        return dto;
    }

    public UserProfileResponse getPublicProfile(String pseudonym, Long currentUserId) {
        User user = userRepository.findByPseudonym(pseudonym)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for: " + pseudonym));
        if (user.getStatus() != com.spilltea.entity.enums.AccountStatus.ACTIVE
                || (currentUserId != null && !user.getId().equals(currentUserId)
                && (blockedUserRepository.existsByBlockerIdAndBlockedId(currentUserId, user.getId())
                || blockedUserRepository.existsByBlockerIdAndBlockedId(user.getId(), currentUserId)))) {
            throw new ResourceNotFoundException("Profile not found for: " + pseudonym);
        }

        UserProfileResponse dto = buildProfileResponse(user, currentUserId);
        dto.setSelf(currentUserId != null && user.getId().equals(currentUserId));
        return dto;
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getDisplayName() != null && (request.getDisplayName().trim().isBlank() || request.getDisplayName().trim().length() > 120)) {
            throw new BadRequestException("Display name must be between 1 and 120 characters.");
        }
        if (request.getPseudonym() != null && (request.getPseudonym().trim().isBlank() || request.getPseudonym().trim().length() > 80
                || !request.getPseudonym().trim().matches("[A-Za-z0-9_-]+"))) {
            throw new BadRequestException("Pen names may contain letters, numbers, underscores, and hyphens.");
        }
        if (request.getBio() != null && request.getBio().length() > 2000) throw new BadRequestException("Bio is too long.");

        if (request.getPseudonym() != null && !request.getPseudonym().trim().equals(user.getPseudonym())) {
            if (userRepository.existsByPseudonym(request.getPseudonym().trim())) {
                throw new BadRequestException("This pen name is already taken. Please choose another.");
            }
            user.setPseudonym(request.getPseudonym().trim());
        }
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getCurrentlyFeeling() != null) user.setCurrentlyFeeling(request.getCurrentlyFeeling().trim());
        if (request.getThemeAccent() != null) user.setThemeAccent(request.getThemeAccent());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());

        User saved = userRepository.save(user);
        UserProfileResponse dto = buildProfileResponse(saved, userId);
        dto.setSelf(true);
        return dto;
    }

    @Transactional
    public String updateAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String url = storageService.store(file, userId);
        String previousAvatar = user.getAvatar();
        user.setAvatar(url);
        userRepository.save(user);
        if (previousAvatar != null && previousAvatar.startsWith("/uploads/")) {
            storageService.delete(previousAvatar);
        }
        return url;
    }

    private UserProfileResponse buildProfileResponse(User user, Long currentUserId) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getId().toString());
        dto.setPseudonym(user.getPseudonym());
        dto.setDisplayName(user.getDisplayName());
        dto.setBio(user.getBio());
        dto.setAvatar(user.getAvatar());
        dto.setThemeAccent(user.getThemeAccent());
        dto.setCurrentlyFeeling(user.getCurrentlyFeeling());
        dto.setJoinedDate(user.getCreatedAt().format(JOINED_FORMATTER));

        // Stats
        KindredStatsResponse kindredStats = kindredService.stats(user.getId());
        long storiesCount = kindredStats.storiesCount();
        long lettersCount = letterRepository.countByAuthorId(user.getId());
        long reactionsReceived = reactionRepository.countByStoryAuthorId(user.getId());

        dto.setStats(new UserProfileResponse.ProfileStats(storiesCount, lettersCount, reactionsReceived));
        dto.setKindredStats(kindredStats);
        dto.setStories(storyService.getPublishedStoriesForAuthor(user.getId(), currentUserId));

        // Moodboard cards (published, public only for non-owners)
        moodboardRepository.findByOwnerId(user.getId()).ifPresent(moodboard -> {
            boolean isOwner = currentUserId != null && user.getId().equals(currentUserId);
            CardScope scope = CardScope.PUBLISHED;
            List<MoodboardCardDto> cards;
            if (isOwner) {
                var draftCards = moodboardCardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(
                        moodboard.getId(), CardScope.DRAFT);
                cards = (draftCards.isEmpty()
                        ? moodboardCardRepository.findByMoodboardIdAndScopeOrderByDisplayOrderAsc(moodboard.getId(), scope)
                        : draftCards)
                        .stream().map(moodboardService::toCardDto).collect(Collectors.toList());
            } else {
                cards = moodboardCardRepository.findByMoodboardIdAndScopeAndVisibilityOrderByDisplayOrderAsc(
                                moodboard.getId(), scope, CardVisibility.PUBLIC)
                        .stream().map(moodboardService::toCardDto).collect(Collectors.toList());
            }
            dto.setMoodboard(cards);
        });

        return dto;
    }
}
