package com.spilltea.controller;

import com.spilltea.dto.common.ApiResponse;
import com.spilltea.dto.upload.UploadResponse;
import com.spilltea.entity.UploadedImage;
import com.spilltea.entity.User;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.repository.UploadedImageRepository;
import com.spilltea.repository.UserRepository;
import com.spilltea.security.UserPrincipal;
import com.spilltea.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/me/uploads/images")
public class UploadController {

    private final StorageService storageService;
    private final UploadedImageRepository uploadRepository;
    private final UserRepository userRepository;

    public UploadController(StorageService storageService,
                            UploadedImageRepository uploadRepository,
                            UserRepository userRepository) {
        this.storageService = storageService;
        this.uploadRepository = uploadRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String url = storageService.store(file, user.getId());

        UploadedImage entity = new UploadedImage(
                user,
                url,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize()
        );

        UploadedImage saved = uploadRepository.save(entity);
        return ResponseEntity.ok(ApiResponse.ok("Memory uploaded to sanctuary gallery.", toDto(saved)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UploadResponse>>> getMyUploadedImages(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<UploadResponse> list = uploadRepository.findByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUploadedImage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UploadedImage image = uploadRepository.findByIdAndUserId(id, principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Image not found in your gallery."));

        storageService.delete(image.getUrl());
        uploadRepository.delete(image);
        return ResponseEntity.ok(ApiResponse.ok("Memory removed from gallery.", null));
    }

    private UploadResponse toDto(UploadedImage img) {
        UploadResponse dto = new UploadResponse();
        dto.setId(img.getId());
        dto.setUrl(img.getUrl());
        dto.setOriginalFilename(img.getOriginalFilename());
        dto.setContentType(img.getContentType());
        dto.setFileSize(img.getFileSize());
        dto.setCreatedAt(img.getCreatedAt() != null ? img.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
        return dto;
    }
}
