package com.spilltea.controller;

import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.letter.LetterRequest;
import com.spilltea.dto.letter.LetterResponse;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.LetterService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LetterController {

    private final LetterService letterService;

    public LetterController(LetterService letterService) {
        this.letterService = letterService;
    }

    @GetMapping("/me/letters")
    public ResponseEntity<ApiResponse<List<LetterResponse>>> getMyLetters(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(letterService.getMyLetters(principal.getId())));
    }

    @GetMapping("/public/letters")
    public ResponseEntity<ApiResponse<Page<LetterResponse>>> getPublicLetters(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, Math.min(size, 50), Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.ok(letterService.getPublicLetters(pageable)));
    }

    @PostMapping("/letters")
    public ResponseEntity<ApiResponse<LetterResponse>> createLetter(
            @Valid @RequestBody LetterRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LetterResponse letter = letterService.createLetter(request, principal.getId());
        String msg = request.isPrivate()
                ? "Letter sealed safely in your private cedar drawer."
                : "Letter released anonymously into the ether.";
        return ResponseEntity.ok(ApiResponse.ok(msg, letter));
    }

    @PutMapping("/letters/{id}")
    public ResponseEntity<ApiResponse<LetterResponse>> updateLetter(
            @PathVariable Long id,
            @Valid @RequestBody LetterRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(letterService.updateLetter(id, request, principal.getId())));
    }

    @DeleteMapping("/letters/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLetter(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        letterService.deleteLetter(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("The letter has been burned and removed.", null));
    }
}
