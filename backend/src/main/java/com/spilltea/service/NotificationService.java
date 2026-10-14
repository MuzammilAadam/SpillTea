package com.spilltea.service;

import com.spilltea.dto.notification.NotificationResponse;
import com.spilltea.entity.Comment;
import com.spilltea.entity.Letter;
import com.spilltea.entity.Notification;
import com.spilltea.entity.Story;
import com.spilltea.entity.User;
import com.spilltea.entity.enums.NotificationType;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.exception.UnauthorizedException;
import com.spilltea.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final Long SSE_TIMEOUT = 300_000L; // 5 minutes

    private final NotificationRepository notificationRepository;
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // ── Real-time SSE Connection ───────────────────────────────────────────────

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));

        try {
            long unread = getUnreadCount(userId);
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("message", "Connected to gentle notification stream", "unreadCount", unread)));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> list = userEmitters.get(userId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    // ── Create & Broadcast Notification ────────────────────────────────────────

    @Transactional
    public NotificationResponse createNotification(User recipient, User actor, NotificationType type,
                                                   String title, String description,
                                                   Story story, Letter letter, Comment comment) {
        if (actor != null && recipient.getId().equals(actor.getId())) {
            // Do not notify on own actions
            return null;
        }

        Notification notification = new Notification(recipient, actor, type, title, description, story, letter, comment);
        Notification saved = notificationRepository.save(notification);
        NotificationResponse dto = toResponse(saved);

        // Push live via SSE
        sendLiveNotification(recipient.getId(), dto);

        return dto;
    }

    private void sendLiveNotification(Long recipientId, NotificationResponse dto) {
        List<SseEmitter> emitters = userEmitters.get(recipientId);
        if (emitters != null && !emitters.isEmpty()) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("notification").data(dto));
                } catch (Exception ex) {
                    removeEmitter(recipientId, emitter);
                }
            }
        }
    }

    // ── Retrieval ──────────────────────────────────────────────────────────────

    public List<NotificationResponse> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 50));
        Page<Notification> paged = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return paged.getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        return getNotifications(userId, 0, 30);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notifId, Long userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not your notification to mark as read.");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

    public NotificationResponse toResponse(Notification n) {
        NotificationResponse dto = new NotificationResponse();
        dto.setId(n.getId().toString());
        dto.setType(n.getType() != null ? n.getType().getClientKey() : "comfort");
        dto.setTitle(n.getTitle());
        dto.setDescription(n.getDescription());
        dto.setTimestamp(formatTimestamp(n.getCreatedAt()));
        dto.setRead(n.isRead());
        dto.setRecipientId(n.getUser() != null ? n.getUser().getId() : null);

        if (n.getStory() != null) {
            dto.setStoryId(n.getStory().getId().toString());
        }
        if (n.getLetter() != null) {
            dto.setLetterId(n.getLetter().getId().toString());
        }
        if (n.getComment() != null) {
            dto.setCommentId(n.getComment().getId().toString());
        }

        if (n.getActor() != null) {
            dto.setActorId(n.getActor().getId());
            dto.setActorPseudonym(n.getActor().getPseudonym());
            dto.setActorAvatar(n.getActor().getAvatar());
        } else {
            dto.setActorPseudonym("Someone");
        }

        if (n.getCreatedAt() != null) {
            dto.setCreatedAt(n.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return dto;
    }

    private String formatTimestamp(LocalDateTime time) {
        if (time == null) return "Just now";
        long minutes = ChronoUnit.MINUTES.between(time, LocalDateTime.now());
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " min ago";
        long hours = ChronoUnit.HOURS.between(time, LocalDateTime.now());
        if (hours < 24) return hours + " hr ago";
        long days = ChronoUnit.DAYS.between(time, LocalDateTime.now());
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        return time.toLocalDate().toString();
    }
}
