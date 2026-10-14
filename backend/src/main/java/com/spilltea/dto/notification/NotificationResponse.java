package com.spilltea.dto.notification;

public class NotificationResponse {
    private String id;
    private String type; // reply, reaction, saved_update, comfort
    private String title;
    private String description;
    private String timestamp;
    private boolean read;
    private String storyId;
    private String letterId;
    private String commentId;
    private String actorPseudonym;
    private String actorAvatar;
    private Long actorId;
    private Long recipientId;
    private String createdAt;

    public NotificationResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getStoryId() { return storyId; }
    public void setStoryId(String storyId) { this.storyId = storyId; }

    public String getLetterId() { return letterId; }
    public void setLetterId(String letterId) { this.letterId = letterId; }

    public String getCommentId() { return commentId; }
    public void setCommentId(String commentId) { this.commentId = commentId; }

    public String getActorPseudonym() { return actorPseudonym; }
    public void setActorPseudonym(String actorPseudonym) { this.actorPseudonym = actorPseudonym; }

    public String getActorAvatar() { return actorAvatar; }
    public void setActorAvatar(String actorAvatar) { this.actorAvatar = actorAvatar; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
