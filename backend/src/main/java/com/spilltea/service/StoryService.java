package com.spilltea.service;

import com.spilltea.dto.comment.CommentRequest;
import com.spilltea.dto.comment.CommentResponse;
import com.spilltea.dto.moodboard.MoodboardCardDto;
import com.spilltea.dto.story.ReactionCountsDto;
import com.spilltea.dto.story.StoryRequest;
import com.spilltea.dto.story.StoryResponse;
import com.spilltea.entity.*;
import com.spilltea.entity.enums.*;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StoryService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final ReactionRepository reactionRepository;
    private final BookmarkRepository bookmarkRepository;
    private final NotificationService notificationService;

    public StoryService(StoryRepository storyRepository, UserRepository userRepository,
                        CommentRepository commentRepository, CommentLikeRepository commentLikeRepository,
                        ReactionRepository reactionRepository, BookmarkRepository bookmarkRepository,
                        NotificationService notificationService) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
        this.reactionRepository = reactionRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.notificationService = notificationService;
    }

    // ── Public Feed ────────────────────────────────────────────────────────────

    public Page<StoryResponse> getPublishedStories(String category, String search,
                                                   Pageable pageable, Long currentUserId) {
        return storyRepository.findPublishedStories(
                PublicationStatus.PUBLISHED, category, search, pageable
        ).map(s -> toStoryResponse(s, currentUserId, false));
    }

    public StoryResponse getPublishedStory(Long storyId, Long currentUserId) {
        Story story = storyRepository.findByIdAndStatus(storyId, PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found or not yet published."));
        return toStoryResponse(story, currentUserId, true);
    }

    // ── Authenticated User Stories ─────────────────────────────────────────────

    public List<StoryResponse> getMyStories(Long userId) {
        return getPublishedStoriesForAuthor(userId, userId);
    }

    public List<StoryResponse> getPublishedStoriesForAuthor(Long authorId, Long viewerId) {
        return storyRepository.findByAuthorIdAndStatus(authorId, PublicationStatus.PUBLISHED)
                .stream()
                .map(s -> toStoryResponse(s, viewerId, false))
                .collect(Collectors.toList());
    }

    public List<StoryResponse> getMyDrafts(Long userId) {
        return storyRepository.findByAuthorIdAndStatusOrderByUpdatedAtDesc(userId, PublicationStatus.DRAFT)
                .stream()
                .map(s -> toStoryResponse(s, userId, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request, Long authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Story story = new Story();
        story.setAuthor(author);
        mapRequestToStory(request, story);

        Story saved = storyRepository.save(story);
        return toStoryResponse(saved, authorId, false);
    }

    @Transactional
    public StoryResponse updateStory(Long storyId, StoryRequest request, Long currentUserId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (!story.getAuthor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only edit your own stories.");
        }

        mapRequestToStory(request, story);
        Story saved = storyRepository.save(story);
        return toStoryResponse(saved, currentUserId, false);
    }

    @Transactional
    public void deleteStory(Long storyId, Long currentUserId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (!story.getAuthor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own stories.");
        }

        story.setStatus(PublicationStatus.REMOVED);
        storyRepository.save(story);
    }

    // ── Reactions ──────────────────────────────────────────────────────────────

    @Transactional
    public StoryResponse toggleReaction(Long storyId, String reactionTypeStr, Long currentUserId) {
        Story story = storyRepository.findByIdAndStatus(storyId, PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ReactionType reactionType = ReactionType.fromClientKey(reactionTypeStr);
        Optional<Reaction> existing = reactionRepository.findByStoryIdAndUserIdAndReactionType(
                storyId, currentUserId, reactionType);

        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
        } else {
            reactionRepository.save(new Reaction(story, user, reactionType));
            // Notify author (not for self-reactions)
            if (!story.getAuthor().getId().equals(currentUserId)) {
                boolean isAnonymous = story.getDisplayMode() == AuthorDisplayMode.ANONYMOUS;
                String actorName = isAnonymous ? "Someone" : user.getPseudonym();
                notificationService.createNotification(
                        story.getAuthor(),
                        isAnonymous ? null : user,
                        NotificationType.REACTION,
                        "Someone felt your words",
                        actorName + " appreciated your story, ‘" + story.getTitle() + "’",
                        story,
                        null,
                        null
                );
            }
        }

        return toStoryResponse(story, currentUserId, false);
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    public List<CommentResponse> getComments(Long storyId, Long currentUserId) {
        List<Comment> topLevel = commentRepository.findTopLevelComments(storyId, CommentStatus.VISIBLE);
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        return topLevel.stream()
                .map(c -> toCommentResponse(c, story, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse addReply(Long parentCommentId, CommentRequest request, Long currentUserId) {
        Comment parent = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        request.setParentCommentId(parentCommentId);
        return addComment(parent.getStory().getId(), request, currentUserId);
    }

    @Transactional
    public CommentResponse addComment(Long storyId, CommentRequest request, Long currentUserId) {
        Story story = storyRepository.findByIdAndStatus(storyId, PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found or not accepting comments."));

        if (story.isLocked()) {
            throw new BadRequestException("This discussion has been locked.");
        }

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = new Comment();
        comment.setStory(story);
        comment.setAuthor(author);
        comment.setBody(request.getContent());

        if (request.getParentCommentId() != null) {
            Comment parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
            comment.setParent(parent);

            Comment saved = commentRepository.save(comment);

            // Notify parent comment author
            if (!parent.getAuthor().getId().equals(currentUserId)) {
                notificationService.createNotification(
                        parent.getAuthor(),
                        author,
                        NotificationType.REPLY,
                        "New reply to your comment",
                        author.getPseudonym() + " replied to your comment on \"" + story.getTitle() + "\"",
                        story,
                        null,
                        saved
                );
            }
            return toCommentResponse(saved, story, currentUserId);
        } else {
            Comment saved = commentRepository.save(comment);

            // Notify story author
            if (!story.getAuthor().getId().equals(currentUserId)) {
                notificationService.createNotification(
                        story.getAuthor(),
                        author,
                        NotificationType.REPLY,
                        "New heartfelt response",
                        author.getPseudonym() + " replied to your story, ‘" + story.getTitle() + "’",
                        story,
                        null,
                        saved
                );
            }
            return toCommentResponse(saved, story, currentUserId);
        }
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest request, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only edit your own comments.");
        }

        comment.setBody(request.getContent());
        Comment saved = commentRepository.save(comment);
        return toCommentResponse(saved, comment.getStory(), currentUserId);
    }

    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own comments.");
        }

        comment.setStatus(CommentStatus.REMOVED);
        commentRepository.save(comment);
    }

    @Transactional
    public CommentResponse pinComment(Long storyId, Long commentId, Long currentUserId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));

        if (!story.getAuthor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the story author can pin comments.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        // Unpin previous
        if (story.getPinnedCommentId() != null && !story.getPinnedCommentId().equals(commentId)) {
            commentRepository.findById(story.getPinnedCommentId()).ifPresent(prev -> {
                prev.setPinned(false);
                commentRepository.save(prev);
            });
        }

        boolean shouldPin = !comment.isPinned();
        comment.setPinned(shouldPin);
        story.setPinnedCommentId(shouldPin ? commentId : null);

        commentRepository.save(comment);
        storyRepository.save(story);

        return toCommentResponse(comment, story, currentUserId);
    }

    @Transactional
    public long toggleCommentLike(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, currentUserId)) {
            commentLikeRepository.deleteByCommentIdAndUserId(commentId, currentUserId);
        } else {
            commentLikeRepository.save(new CommentLike(comment, user));
        }

        return commentLikeRepository.countByCommentId(commentId);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private void mapRequestToStory(StoryRequest request, Story story) {
        story.setTitle(request.getTitle().trim());
        story.setBody(request.getContent().trim());

        String content = request.getContent();
        story.setExcerpt(content.length() > 200 ? content.substring(0, 200) + "..." : content);
        story.setCategory(request.getCategory() != null ? request.getCategory() : "Life");
        story.setIntent(request.getIntent() != null ? request.getIntent() : StoryIntent.VENT);
        story.setMood(request.getMood());
        story.setContentWarning(request.getContentWarning());
        story.setDisplayMode(request.getDisplayMode() != null ? request.getDisplayMode() : AuthorDisplayMode.PSEUDONYM);
        story.setStatus(request.isPrivate() ? PublicationStatus.DRAFT : PublicationStatus.PUBLISHED);
        story.setReadTime(estimateReadTime(request.getContent()));
        story.setImage(request.getImage());

        if (request.getTags() != null) {
            story.setTags(String.join(",", request.getTags()));
        }
    }

    private String estimateReadTime(String content) {
        if (content == null) return "1 min read";
        int words = content.trim().split("\\s+").length;
        int minutes = Math.max(1, (int) Math.ceil(words / 200.0));
        return minutes + " min read";
    }

    StoryResponse toStoryResponse(Story story, Long currentUserId, boolean includeComments) {
        StoryResponse dto = new StoryResponse();
        dto.setId(story.getId().toString());
        dto.setTitle(story.getTitle());
        dto.setContent(story.getBody());
        dto.setExcerpt(story.getExcerpt());
        dto.setReadTime(story.getReadTime());
        dto.setImage(story.getImage());
        dto.setCategory(story.getCategory());
        dto.setMood(story.getMood());
        dto.setContentWarning(story.getContentWarning());

        // Author display
        if (story.getDisplayMode() == AuthorDisplayMode.ANONYMOUS) {
            dto.setAuthorPseudonym("Anonymous");
            dto.setAuthorAvatar(null);
        } else {
            dto.setAuthorPseudonym(story.getAuthor().getPseudonym());
            dto.setAuthorAvatar(story.getAuthor().getAvatar());
        }

        // Date
        dto.setDate(story.getCreatedAt().format(DATE_FORMATTER));

        // Tags
        if (story.getTags() != null && !story.getTags().isBlank()) {
            dto.setTags(Arrays.asList(story.getTags().split(",")));
        }

        // Intent
        dto.setIntent(story.getIntent() != null ? story.getIntent().name().toLowerCase() : "vent");

        // Reactions
        List<Object[]> rawCounts = reactionRepository.countReactionsByStoryGrouped(story.getId());
        ReactionCountsDto counts = new ReactionCountsDto();
        for (Object[] row : rawCounts) {
            ReactionType type = (ReactionType) row[0];
            long count = (Long) row[1];
            switch (type) {
                case HEAR_YOU -> counts.setHearYou(count);
                case FELT_THIS_TOO -> counts.setFeltThisToo(count);
                case THANK_YOU -> counts.setThankYou(count);
                case SENDING_SUPPORT -> counts.setSendingSupport(count);
            }
        }
        dto.setReactions(counts);

        // User-specific data
        if (currentUserId != null) {
            List<Reaction> userReacts = reactionRepository.findByStoryIdAndUserId(story.getId(), currentUserId);
            dto.setUserReactions(userReacts.stream()
                    .map(r -> r.getReactionType().getClientKey())
                    .collect(Collectors.toList()));
            dto.setSaved(bookmarkRepository.existsByUserIdAndStoryId(currentUserId, story.getId()));
            dto.setAuthor(story.getAuthor().getId().equals(currentUserId));
            dto.setPrivate(story.getStatus() == PublicationStatus.DRAFT);
        }

        // Comment count
        dto.setCommentsCount((int) commentRepository.countByStoryIdAndStatus(story.getId(), CommentStatus.VISIBLE));

        // Comments
        if (includeComments) {
            List<Comment> topLevel = commentRepository.findTopLevelComments(story.getId(), CommentStatus.VISIBLE);
            dto.setComments(topLevel.stream()
                    .map(c -> toCommentResponse(c, story, currentUserId))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private CommentResponse toCommentResponse(Comment comment, Story story, Long currentUserId) {
        CommentResponse dto = new CommentResponse();
        dto.setId(comment.getId().toString());
        dto.setStoryId(comment.getStory().getId().toString());
        dto.setAuthorPseudonym(comment.getAuthor().getPseudonym());
        dto.setAuthorAvatar(comment.getAuthor().getAvatar());
        dto.setContent(comment.getBody());
        dto.setTimestamp(formatTimestamp(comment.getCreatedAt()));
        dto.setLikes(commentLikeRepository.countByCommentId(comment.getId()));
        dto.setPinned(comment.isPinned());
        dto.setStoryAuthor(story != null && story.getAuthor().getId().equals(comment.getAuthor().getId()));

        if (currentUserId != null) {
            dto.setUserLiked(commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), currentUserId));
            dto.setCommentAuthor(comment.getAuthor().getId().equals(currentUserId));
        }

        // Nested replies
        List<Comment> replies = commentRepository.findByParentIdAndStatusOrderByCreatedAtAsc(
                comment.getId(), CommentStatus.VISIBLE);
        dto.setReplies(replies.stream()
                .map(r -> toCommentResponse(r, story, currentUserId))
                .collect(Collectors.toList()));

        return dto;
    }

    private String formatTimestamp(LocalDateTime time) {
        if (time == null) return "Just now";
        long minutes = ChronoUnit.MINUTES.between(time, LocalDateTime.now());
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        long hours = ChronoUnit.HOURS.between(time, LocalDateTime.now());
        if (hours < 24) return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        long days = ChronoUnit.DAYS.between(time, LocalDateTime.now());
        if (days < 7) return days + " day" + (days == 1 ? "" : "s") + " ago";
        return time.format(DATE_FORMATTER);
    }
}
