package com.spilltea.controller;

import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.moderation.ModerationActionRequest;
import com.spilltea.dto.moderation.ReportRequest;
import com.spilltea.dto.moderation.ReportResponse;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReportResponse response = moderationService.submitReport(request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Thank you for keeping this space safe. We've received your note.", response));
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        moderationService.blockUser(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("User blocked.", null));
    }

    @DeleteMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<Void>> unblockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        moderationService.unblockUser(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("User unblocked.", null));
    }

    @GetMapping("/me/blocked-users")
    public ResponseEntity<ApiResponse<List<Long>>> getBlockedUsers(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(moderationService.getBlockedUserIds(principal.getId())));
    }

    // ── Moderator Endpoints ───────────────────────────────────────────────────

    @GetMapping("/moderation/reports")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(moderationService.getReports(status, pageable)));
    }

    @PatchMapping("/moderation/reports/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable Long id,
            @Valid @RequestBody ModerationActionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(moderationService.resolveReport(id, request)));
    }
}
