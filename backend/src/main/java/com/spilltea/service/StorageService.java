package com.spilltea.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Abstracts file storage so it can later be replaced with S3
 * without touching moodboard business logic.
 */
@Service
public class StorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            Arrays.asList("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Path storageRoot;

    public StorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.storageRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(storageRoot);
    }

    public String store(MultipartFile file, Long ownerId) throws IOException {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        String storedFilename = ownerId + "_" + UUID.randomUUID() + extension;
        Path targetLocation = storageRoot.resolve(storedFilename);

        // Prevent path traversal
        if (!targetLocation.toAbsolutePath().startsWith(storageRoot)) {
            throw new IllegalArgumentException("Invalid file path detected.");
        }

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + storedFilename;
    }

    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) return;
        try {
            String filename = fileUrl.substring("/uploads/".length());
            Path filePath = storageRoot.resolve(filename);
            if (filePath.toAbsolutePath().startsWith(storageRoot)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ex) {
            // Log but don't throw — deletion failures are non-critical
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or missing.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10 MB limit.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
        }
    }
}
