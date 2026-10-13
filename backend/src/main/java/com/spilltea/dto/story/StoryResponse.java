package com.spilltea.dto.story;

import com.spilltea.dto.comment.CommentResponse;
import java.util.ArrayList;
import java.util.List;

public class StoryResponse {
    private String id;
    private String title;
    private String content;
    private String excerpt;
    private String authorPseudonym;
    private String authorAvatar;
    private String date;
    private String category;
    private List<String> tags = new ArrayList<>();
    private String intent;
    private String mood;
    private String contentWarning;
    private ReactionCountsDto reactions = new ReactionCountsDto();
    private List<String> userReactions = new ArrayList<>();
    private int commentsCount = 0;
    private boolean saved = false;
    private String readTime;
    private String image;
    private boolean isPrivate = false;
    private boolean isAuthor = false;
    private List<CommentResponse> comments = new ArrayList<>();

    public StoryResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getAuthorPseudonym() { return authorPseudonym; }
    public void setAuthorPseudonym(String authorPseudonym) { this.authorPseudonym = authorPseudonym; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getContentWarning() { return contentWarning; }
    public void setContentWarning(String contentWarning) { this.contentWarning = contentWarning; }

    public ReactionCountsDto getReactions() { return reactions; }
    public void setReactions(ReactionCountsDto reactions) { this.reactions = reactions; }

    public List<String> getUserReactions() { return userReactions; }
    public void setUserReactions(List<String> userReactions) { this.userReactions = userReactions; }

    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }

    public boolean isSaved() { return saved; }
    public void setSaved(boolean saved) { this.saved = saved; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public boolean isAuthor() { return isAuthor; }
    public void setAuthor(boolean author) { isAuthor = author; }

    public List<CommentResponse> getComments() { return comments; }
    public void setComments(List<CommentResponse> comments) { this.comments = comments; }
}
