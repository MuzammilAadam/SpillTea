package com.spilltea.controller;

import com.spilltea.dto.bookmark.CollectionRequest;
import com.spilltea.dto.bookmark.CollectionResponse;
import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.story.StoryResponse;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.BookmarkService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PutMapping("/stories/{id}/bookmark")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> bookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean saved = bookmarkService.toggleBookmark(id, principal.getId());
        String msg = saved ? "Saved quietly in your keepsakes chest." : "Removed from saved keepsakes.";
        return ResponseEntity.ok(ApiResponse.ok(msg, Map.of("saved", saved)));
    }

    @DeleteMapping("/stories/{id}/bookmark")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> removeBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean saved = bookmarkService.toggleBookmark(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Removed from saved keepsakes.", Map.of("saved", saved)));
    }

    @GetMapping("/me/bookmarks")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getBookmarks(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getBookmarks(principal.getId())));
    }

    @GetMapping("/me/collections")
    public ResponseEntity<ApiResponse<List<CollectionResponse>>> getCollections(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getCollections(principal.getId())));
    }

    @PostMapping("/me/collections")
    public ResponseEntity<ApiResponse<CollectionResponse>> createCollection(
            @Valid @RequestBody CollectionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.createCollection(request, principal.getId())));
    }

    @PutMapping("/me/collections/{collectionId}")
    public ResponseEntity<ApiResponse<CollectionResponse>> updateCollection(
            @PathVariable Long collectionId,
            @Valid @RequestBody CollectionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.updateCollection(collectionId, request, principal.getId())));
    }

    @DeleteMapping("/me/collections/{collectionId}")
    public ResponseEntity<ApiResponse<Void>> deleteCollection(
            @PathVariable Long collectionId,
            @AuthenticationPrincipal UserPrincipal principal) {
        bookmarkService.deleteCollection(collectionId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Collection removed.", null));
    }
}
