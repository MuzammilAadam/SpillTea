package com.spilltea.dto.moodboard;

import java.util.ArrayList;
import java.util.List;

public class MoodboardDto {
    private Long id;
    private String title;
    private String description;
    private String themeConfig;
    private boolean published;
    private Long version;
    private boolean isOwner = false;
    private boolean hasUnpublishedDraft = false;
    private List<MoodboardCardDto> cards = new ArrayList<>();

    public MoodboardDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getThemeConfig() { return themeConfig; }
    public void setThemeConfig(String themeConfig) { this.themeConfig = themeConfig; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public boolean isOwner() { return isOwner; }
    public void setOwner(boolean owner) { isOwner = owner; }

    public boolean isHasUnpublishedDraft() { return hasUnpublishedDraft; }
    public void setHasUnpublishedDraft(boolean hasUnpublishedDraft) { this.hasUnpublishedDraft = hasUnpublishedDraft; }

    public List<MoodboardCardDto> getCards() { return cards; }
    public void setCards(List<MoodboardCardDto> cards) { this.cards = cards; }
}
