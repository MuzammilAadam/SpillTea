package com.spilltea.service;

import com.spilltea.dto.notification.NotificationResponse;
import com.spilltea.entity.Notification;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notifId, Long userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not your notification.");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId().toString());
        dto.setType(n.getType().getClientKey());
        dto.setTitle(n.getTitle());
        dto.setDescription(n.getDescription());
        dto.setTimestamp(formatTimestamp(n.getCreatedAt()));
        dto.setRead(n.isRead());
        if (n.getStory() != null) dto.setStoryId(n.getStory().getId().toString());
        return dto;
    }

    private String formatTimestamp(LocalDateTime time) {
        if (time == null) return "Just now";
        long minutes = ChronoUnit.MINUTES.between(time, LocalDateTime.now());
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        long hours = ChronoUnit.HOURS.between(time, LocalDateTime.now());
        if (hours < 24) return hours + " hours ago";
        long days = ChronoUnit.DAYS.between(time, LocalDateTime.now());
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        return time.toLocalDate().toString();
    }
}
