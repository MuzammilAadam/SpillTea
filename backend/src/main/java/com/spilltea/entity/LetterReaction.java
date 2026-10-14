package com.spilltea.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "letter_reactions", indexes = {
    @Index(name = "idx_letter_reaction_letter", columnList = "letter_id"),
    @Index(name = "idx_letter_reaction_user", columnList = "user_id")
})
public class LetterReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "letter_id", nullable = false)
    private Letter letter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reaction_type", nullable = false, length = 50)
    private String reactionType = "feltThisToo";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public LetterReaction() {}

    public LetterReaction(Letter letter, User user, String reactionType) {
        this.letter = letter;
        this.user = user;
        this.reactionType = reactionType;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Letter getLetter() { return letter; }
    public void setLetter(Letter letter) { this.letter = letter; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getReactionType() { return reactionType; }
    public void setReactionType(String reactionType) { this.reactionType = reactionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
