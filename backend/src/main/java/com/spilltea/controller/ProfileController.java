package com.spilltea.controller;

import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.profile.UpdateProfileRequest;
import com.spilltea.dto.profile.UserProfileResponse;
import com.spilltea.dto.profile.KindredPageResponse;
import com.spilltea.dto.profile.KindredStatsResponse;
import com.spilltea.dto.profile.RelationshipResponse;
import com.spilltea.dto.profile.PeopleSearchResponse;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.ProfileService;
import com.spilltea.service.KindredService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;
    private final KindredService kindredService;

    public ProfileController(ProfileService profileService, KindredService kindredService) {
        this.profileService = profileService;
        this.kindredService = kindredService;
    }

    @GetMapping("/profiles/{pseudonym}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getPublicProfile(
            @PathVariable String pseudonym,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(ApiResponse.ok(profileService.getPublicProfile(pseudonym, userId)));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getMyProfile(principal.getId())));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserProfileResponse profile = profileService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Your scrapbook profile has been personalized.", profile));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> patchProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok("Your scrapbook profile has been personalized.", profileService.updateProfile(principal.getId(), request)));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        String url = profileService.updateAvatar(principal.getId(), file);
        return ResponseEntity.ok(ApiResponse.ok("Avatar updated.", Map.of("avatar", url)));
    }

    @PostMapping("/me/profile/photo")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("Your profile photograph has been saved.", Map.of("avatar", profileService.updateAvatar(principal.getId(), file))));
    }

    @GetMapping("/profiles/search")
    public ResponseEntity<ApiResponse<Page<PeopleSearchResponse>>> searchProfiles(
            @RequestParam String q, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.ok(Page.empty()));
        }
        return ResponseEntity.ok(ApiResponse.ok(kindredService.search(q, principal == null ? null : principal.getId(), page, size)));
    }

    @GetMapping("/profiles/{userId}/stats")
    public ResponseEntity<ApiResponse<KindredStatsResponse>> getStats(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.stats(userId)));
    }

    @PutMapping("/profiles/{userId}/follow")
    public ResponseEntity<ApiResponse<KindredStatsResponse>> follow(@PathVariable Long userId,
                                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok("You found your way to this little corner.", kindredService.follow(principal.getId(), userId)));
    }

    @DeleteMapping("/profiles/{userId}/follow")
    public ResponseEntity<ApiResponse<KindredStatsResponse>> unfollow(@PathVariable Long userId,
                                                                       @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok("You gently stepped away from this corner.", kindredService.unfollow(principal.getId(), userId)));
    }

    @GetMapping("/profiles/{userId}/relationship")
    public ResponseEntity<ApiResponse<RelationshipResponse>> relationship(@PathVariable Long userId,
                                                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.relationship(principal == null ? null : principal.getId(), userId)));
    }

    @GetMapping("/profiles/{userId}/kindred")
    public ResponseEntity<ApiResponse<KindredPageResponse>> kindred(@PathVariable Long userId,
                                                                      @RequestParam(defaultValue = "0") int page,
                                                                      @RequestParam(defaultValue = "20") int size,
                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.list(userId, false, principal == null ? null : principal.getId(), page, size)));
    }

    @GetMapping("/profiles/{userId}/my-kindred")
    public ResponseEntity<ApiResponse<KindredPageResponse>> myKindred(@PathVariable Long userId,
                                                                        @RequestParam(defaultValue = "0") int page,
                                                                        @RequestParam(defaultValue = "20") int size,
                                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.list(userId, true, principal == null ? null : principal.getId(), page, size)));
    }

    @GetMapping("/me/kindred")
    public ResponseEntity<ApiResponse<KindredPageResponse>> myFollowers(@RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "20") int size,
                                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.list(principal.getId(), false, principal.getId(), page, size)));
    }

    @GetMapping("/me/my-kindred")
    public ResponseEntity<ApiResponse<KindredPageResponse>> myFollowing(@RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "20") int size,
                                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(kindredService.list(principal.getId(), true, principal.getId(), page, size)));
    }
}
