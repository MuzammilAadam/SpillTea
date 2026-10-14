package com.spilltea.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows", uniqueConstraints = {
    @UniqueConstraint(name = "uk_follow_follower_followed", columnNames = {"follower_id", "followed_id"})
}, indexes = {
    @Index(name = "idx_follow_follower", columnList = "follower_id"),
    @Index(name = "idx_follow_followed", columnList = "followed_id")
})
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "follower_id", nullable = false, foreignKey = @ForeignKey(name = "fk_follow_follower"))
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "followed_id", nullable = false, foreignKey = @ForeignKey(name = "fk_follow_followed"))
    private User followed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Follow() {}
    public Follow(User follower, User followed) { this.follower = follower; this.followed = followed; }
    public Long getId() { return id; }
    public User getFollower() { return follower; }
    public User getFollowed() { return followed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
