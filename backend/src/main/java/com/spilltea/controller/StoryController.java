package com.spilltea.controller;

import com.spilltea.dto.comment.CommentRequest;
import com.spilltea.dto.comment.CommentResponse;
import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.story.StoryRequest;
import com.spilltea.dto.story.StoryResponse;
import com.spilltea.dto.moderation.ReportRequest;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.StoryService;
import com.spilltea.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StoryController {

    private final StoryService storyService;
    private final ModerationService moderationService;

    public StoryController(StoryService storyService, ModerationService moderationService) {
        this.storyService = storyService;
        this.moderationService = moderationService;
    }

    // ── Public Story Feed ──────────────────────────────────────────────────────

    @GetMapping("/stories")
    public ResponseEntity<ApiResponse<Page<StoryResponse>>> getStories(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortBy.equals("updatedAt") ? Sort.by("updatedAt").descending()
                : Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), sort);

        Long userId = principal != null ? principal.getId() : null;
        Page<StoryResponse> stories = storyService.getPublishedStories(category, search, pageable, userId);
        return ResponseEntity.ok(ApiResponse.ok(stories));
    }

    @GetMapping("/stories/{id}")
    public ResponseEntity<ApiResponse<StoryResponse>> getStory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        StoryResponse story = storyService.getPublishedStory(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(story));
    }

    // ── Authenticated Story Operations ─────────────────────────────────────────

    @PostMapping("/stories")
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @Valid @RequestBody StoryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        StoryResponse story = storyService.createStory(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Your story has been released gently into the journal.", story));
    }

    @PutMapping("/stories/{id}")
    public ResponseEntity<ApiResponse<StoryResponse>> updateStory(
            @PathVariable Long id,
            @Valid @RequestBody StoryRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        StoryResponse story = storyService.updateStory(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Story updated.", story));
    }

    @DeleteMapping("/stories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        storyService.deleteStory(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Story quietly removed.", null));
    }

    // ── My Stories / Drafts ─────────────────────────────────────────────────────

    @GetMapping("/me/stories")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getMyStories(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(storyService.getMyStories(principal.getId())));
    }

    @GetMapping("/me/drafts")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getMyDrafts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(storyService.getMyDrafts(principal.getId())));
    }

    // ── Comments ────────────────────────────────────────────────────────────────

    @GetMapping("/stories/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(storyService.getComments(id, userId)));
    }

    @PostMapping("/stories/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponse comment = storyService.addComment(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Your whisper has been gently penciled onto the page.", comment));
    }

    @PostMapping("/comments/{id}/replies")
    public ResponseEntity<ApiResponse<CommentResponse>> addReply(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        // Look up parent comment to get the correct storyId
        request.setParentCommentId(id);
        // We'll resolve story via the parent comment in StoryService
        CommentResponse comment = storyService.addReply(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(comment));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(storyService.updateComment(id, request, principal.getId())));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        storyService.deleteComment(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Comment removed.", null));
    }

    @PostMapping("/stories/{storyId}/comments/{commentId}/pin")
    public ResponseEntity<ApiResponse<CommentResponse>> pinComment(
            @PathVariable Long storyId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserPrincipal principal) {
        CommentResponse comment = storyService.pinComment(storyId, commentId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Comment pinned.", comment));
    }

    @PostMapping("/comments/{id}/like")
    public ResponseEntity<ApiResponse<Long>> likeComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        long likes = storyService.toggleCommentLike(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(likes));
    }

    // ── Reactions ────────────────────────────────────────────────────────────────

    @PutMapping("/stories/{id}/reactions/{type}")
    public ResponseEntity<ApiResponse<StoryResponse>> addReaction(
            @PathVariable Long id,
            @PathVariable String type,
            @AuthenticationPrincipal UserPrincipal principal) {
        StoryResponse story = storyService.toggleReaction(id, type, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(story));
    }

    @DeleteMapping("/stories/{id}/reactions/{type}")
    public ResponseEntity<ApiResponse<StoryResponse>> removeReaction(
            @PathVariable Long id,
            @PathVariable String type,
            @AuthenticationPrincipal UserPrincipal principal) {
        StoryResponse story = storyService.toggleReaction(id, type, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(story));
    }

    // ── Reporting ─────────────────────────────────────────────────────────────────

    @PostMapping("/stories/{id}/report")
    public ResponseEntity<ApiResponse<Void>> reportStory(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReportRequest request = new ReportRequest();
        request.setStoryId(id);
        request.setReason(body == null ? null : body.get("reason"));
        moderationService.submitReport(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Thank you for keeping this space safe.", null));
    }
}
