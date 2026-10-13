package com.spilltea.entity;

import com.spilltea.entity.enums.AuthorDisplayMode;
import com.spilltea.entity.enums.PublicationStatus;
import com.spilltea.entity.enums.StoryIntent;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stories", indexes = {
    @Index(name = "idx_story_status", columnList = "status"),
    @Index(name = "idx_story_category", columnList = "category"),
    @Index(name = "idx_story_created", columnList = "created_at")
})
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String body;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(nullable = false, length = 80)
    private String category = "Life";

    @Column(length = 255)
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StoryIntent intent = StoryIntent.VENT;

    @Column(length = 50)
    private String mood;

    @Column(length = 255)
    private String contentWarning;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PublicationStatus status = PublicationStatus.PUBLISHED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuthorDisplayMode displayMode = AuthorDisplayMode.PSEUDONYM;

    @Column(nullable = false)
    private boolean isLocked = false;

    @Column
    private Long pinnedCommentId;

    @Column(length = 50)
    private String readTime = "3 min read";

    @Column(length = 500)
    private String image;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    public Story() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == PublicationStatus.PUBLISHED && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == PublicationStatus.PUBLISHED && publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public StoryIntent getIntent() { return intent; }
    public void setIntent(StoryIntent intent) { this.intent = intent; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getContentWarning() { return contentWarning; }
    public void setContentWarning(String contentWarning) { this.contentWarning = contentWarning; }

    public PublicationStatus getStatus() { return status; }
    public void setStatus(PublicationStatus status) { this.status = status; }

    public AuthorDisplayMode getDisplayMode() { return displayMode; }
    public void setDisplayMode(AuthorDisplayMode displayMode) { this.displayMode = displayMode; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public Long getPinnedCommentId() { return pinnedCommentId; }
    public void setPinnedCommentId(Long pinnedCommentId) { this.pinnedCommentId = pinnedCommentId; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
