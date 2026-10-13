package com.spilltea.controller;

import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.moodboard.*;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.MoodboardService;
import com.spilltea.service.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MoodboardController {

    private final MoodboardService moodboardService;
    private final StorageService storageService;

    public MoodboardController(MoodboardService moodboardService, StorageService storageService) {
        this.moodboardService = moodboardService;
        this.storageService = storageService;
    }

    @GetMapping("/moodboards/me")
    public ResponseEntity<ApiResponse<MoodboardDto>> getMyMoodboard(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(moodboardService.getMyMoodboard(principal.getId())));
    }

    @GetMapping("/profiles/{pseudonym}/moodboard")
    public ResponseEntity<ApiResponse<MoodboardDto>> getPublicMoodboard(
            @PathVariable String pseudonym,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(moodboardService.getPublicMoodboard(pseudonym, userId)));
    }

    @PutMapping("/moodboards/me/draft")
    public ResponseEntity<ApiResponse<MoodboardDto>> saveDraft(
            @RequestBody SaveMoodboardRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Draft saved safely in your desk drawer.",
                moodboardService.saveDraft(principal.getId(), request)));
    }

    @PostMapping("/moodboards/me/publish")
    public ResponseEntity<ApiResponse<MoodboardDto>> publish(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Your moodboard has been published beautifully.",
                moodboardService.publish(principal.getId())));
    }

    @PostMapping("/moodboards/me/discard-draft")
    public ResponseEntity<ApiResponse<MoodboardDto>> discardDraft(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Draft discarded. Restored to last published version.",
                moodboardService.discardDraft(principal.getId())));
    }

    @PostMapping("/moodboards/me/cards")
    public ResponseEntity<ApiResponse<MoodboardCardDto>> addCard(
            @RequestBody MoodboardCardDto cardDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(moodboardService.addCard(principal.getId(), cardDto)));
    }

    @PutMapping("/moodboards/me/cards/{cardId}")
    public ResponseEntity<ApiResponse<MoodboardCardDto>> updateCard(
            @PathVariable Long cardId,
            @RequestBody MoodboardCardDto cardDto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(moodboardService.updateCard(principal.getId(), cardId, cardDto)));
    }

    @DeleteMapping("/moodboards/me/cards/{cardId}")
    public ResponseEntity<ApiResponse<Void>> deleteCard(
            @PathVariable Long cardId,
            @AuthenticationPrincipal UserPrincipal principal) {
        moodboardService.deleteCard(principal.getId(), cardId);
        return ResponseEntity.ok(ApiResponse.ok("Card quietly removed.", null));
    }

    @PutMapping("/moodboards/me/cards/reorder")
    public ResponseEntity<ApiResponse<List<MoodboardCardDto>>> reorderCards(
            @RequestBody ReorderCardsRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(moodboardService.reorderCards(principal.getId(), request)));
    }

    @PostMapping("/moodboards/me/cards/image")
    public ResponseEntity<ApiResponse<String>> uploadCardImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        String url = storageService.store(file, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded.", url));
    }
}
