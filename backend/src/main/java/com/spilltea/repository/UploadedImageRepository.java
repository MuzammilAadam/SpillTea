package com.spilltea.repository;

import com.spilltea.entity.UploadedImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UploadedImageRepository extends JpaRepository<UploadedImage, Long> {
    List<UploadedImage> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UploadedImage> findByIdAndUserId(Long id, Long userId);
}
