package com.spilltea.entity;

import com.spilltea.entity.enums.CardScope;
import com.spilltea.entity.enums.CardType;
import com.spilltea.entity.enums.CardVisibility;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "moodboard_cards", indexes = {
    @Index(name = "idx_card_moodboard", columnList = "moodboard_id"),
    @Index(name = "idx_card_scope", columnList = "scope")
})
public class MoodboardCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moodboard_id", nullable = false)
    private Moodboard moodboard;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false, length = 30)
    private CardType cardType;

    @Column(name = "content_json", columnDefinition = "TEXT")
    private String contentJson;

    @Column(name = "position_x")
    private Double positionX = 0.0;

    @Column(name = "position_y")
    private Double positionY = 0.0;

    @Column
    private Double width;

    @Column
    private Double height;

    @Column(length = 50)
    private String rotation = "rotate-0";

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "style_config_json", columnDefinition = "TEXT")
    private String styleConfigJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardVisibility visibility = CardVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CardScope scope = CardScope.PUBLISHED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MoodboardCard() {}

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

    public Moodboard getMoodboard() { return moodboard; }
    public void setMoodboard(Moodboard moodboard) { this.moodboard = moodboard; }

    public CardType getCardType() { return cardType; }
    public void setCardType(CardType cardType) { this.cardType = cardType; }

    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }

    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }

    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }

    public Double getWidth() { return width; }
    public void setWidth(Double width) { this.width = width; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public String getRotation() { return rotation; }
    public void setRotation(String rotation) { this.rotation = rotation; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public String getStyleConfigJson() { return styleConfigJson; }
    public void setStyleConfigJson(String styleConfigJson) { this.styleConfigJson = styleConfigJson; }

    public CardVisibility getVisibility() { return visibility; }
    public void setVisibility(CardVisibility visibility) { this.visibility = visibility; }

    public CardScope getScope() { return scope; }
    public void setScope(CardScope scope) { this.scope = scope; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
