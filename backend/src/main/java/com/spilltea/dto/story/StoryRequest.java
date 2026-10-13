package com.spilltea.dto.story;

import com.spilltea.entity.enums.AuthorDisplayMode;
import com.spilltea.entity.enums.StoryIntent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class StoryRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Story content is required")
    private String content;

    private String category = "Life";
    private List<String> tags;
    private StoryIntent intent = StoryIntent.VENT;
    private String mood;
    private String contentWarning;
    private boolean isPrivate = false; // if true, status is DRAFT
    private AuthorDisplayMode displayMode = AuthorDisplayMode.PSEUDONYM;
    private String readTime;
    private String image;

    public StoryRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public StoryIntent getIntent() { return intent; }
    public void setIntent(StoryIntent intent) { this.intent = intent; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getContentWarning() { return contentWarning; }
    public void setContentWarning(String contentWarning) { this.contentWarning = contentWarning; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public AuthorDisplayMode getDisplayMode() { return displayMode; }
    public void setDisplayMode(AuthorDisplayMode displayMode) { this.displayMode = displayMode; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
