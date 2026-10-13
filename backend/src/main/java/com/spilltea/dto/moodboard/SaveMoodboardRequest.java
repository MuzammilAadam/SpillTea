package com.spilltea.dto.moodboard;

import java.util.ArrayList;
import java.util.List;

public class SaveMoodboardRequest {
    private String title;
    private String description;
    private String themeConfig;
    private Long version;
    private List<MoodboardCardDto> cards = new ArrayList<>();

    public SaveMoodboardRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getThemeConfig() { return themeConfig; }
    public void setThemeConfig(String themeConfig) { this.themeConfig = themeConfig; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public List<MoodboardCardDto> getCards() { return cards; }
    public void setCards(List<MoodboardCardDto> cards) { this.cards = cards; }
}
