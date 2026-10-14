package com.spilltea.service;

import com.spilltea.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
            Arrays.asList("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

    private static final List<String> ALLOWED_EXTENSIONS =
            Arrays.asList(".jpg", ".jpeg", ".png", ".webp");

    private void validateFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a photo before uploading.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Photographs must be 5 MB or smaller.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Please upload a JPEG, PNG, or WebP photograph.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(ext)) {
                throw new BadRequestException("Please upload a JPEG, PNG, or WebP photograph.");
            }
        }

        byte[] header = file.getInputStream().readNBytes(12);
        if (!hasAllowedImageSignature(header, contentType.toLowerCase())) {
            throw new BadRequestException("That file does not look like a supported photograph.");
        }
    }

    private boolean hasAllowedImageSignature(byte[] header, String contentType) {
        if ("image/jpeg".equals(contentType)) {
            return header.length >= 3
                    && (header[0] & 0xFF) == 0xFF
                    && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
        }
        if ("image/png".equals(contentType)) {
            return header.length >= 8
                    && (header[0] & 0xFF) == 0x89
                    && header[1] == 0x50
                    && header[2] == 0x4E
                    && header[3] == 0x47
                    && header[4] == 0x0D
                    && header[5] == 0x0A
                    && header[6] == 0x1A
                    && header[7] == 0x0A;
        }
        if ("image/webp".equals(contentType)) {
            return header.length >= 12
                    && header[0] == 0x52
                    && header[1] == 0x49
                    && header[2] == 0x46
                    && header[3] == 0x46
                    && header[8] == 0x57
                    && header[9] == 0x45
                    && header[10] == 0x42
                    && header[11] == 0x50;
        }
        return false;
    }
}
