package com.spilltea.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "letters", indexes = {
    @Index(name = "idx_letter_author", columnList = "author_id"),
    @Index(name = "idx_letter_private", columnList = "is_private")
})
public class Letter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 150)
    private String recipient = "Someone";

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String body;

    @Column(nullable = false, length = 100)
    private String category = "To My Younger Self";

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;

    @Column(name = "envelope_color", length = 30)
    private String envelopeColor = "#B7B99A";

    @Column(name = "stamp_style", length = 50)
    private String stampStyle = "olive-wreath";

    @Column(name = "washi_color", length = 30)
    private String washiColor = "#F7DDE1";

    @Column(name = "paper_texture", length = 50)
    private String paperTexture = "laid-paper";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Letter() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public String getEnvelopeColor() { return envelopeColor; }
    public void setEnvelopeColor(String envelopeColor) { this.envelopeColor = envelopeColor; }

    public String getStampStyle() { return stampStyle; }
    public void setStampStyle(String stampStyle) { this.stampStyle = stampStyle; }

    public String getWashiColor() { return washiColor; }
    public void setWashiColor(String washiColor) { this.washiColor = washiColor; }

    public String getPaperTexture() { return paperTexture; }
    public void setPaperTexture(String paperTexture) { this.paperTexture = paperTexture; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
