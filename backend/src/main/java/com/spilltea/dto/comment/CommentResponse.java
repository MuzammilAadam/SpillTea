package com.spilltea.dto.comment;

import java.util.ArrayList;
import java.util.List;

public class CommentResponse {
    private String id;
    private String storyId;
    private String authorPseudonym;
    private String authorAvatar;
    private String content;
    private String timestamp;
    private long likes = 0;
    private boolean userLiked = false;
    private boolean isPinned = false;
    private boolean isStoryAuthor = false;
    private boolean isCommentAuthor = false;
    private List<CommentResponse> replies = new ArrayList<>();

    public CommentResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStoryId() { return storyId; }
    public void setStoryId(String storyId) { this.storyId = storyId; }

    public String getAuthorPseudonym() { return authorPseudonym; }
    public void setAuthorPseudonym(String authorPseudonym) { this.authorPseudonym = authorPseudonym; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public long getLikes() { return likes; }
    public void setLikes(long likes) { this.likes = likes; }

    public boolean isUserLiked() { return userLiked; }
    public void setUserLiked(boolean userLiked) { this.userLiked = userLiked; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public boolean isStoryAuthor() { return isStoryAuthor; }
    public void setStoryAuthor(boolean storyAuthor) { isStoryAuthor = storyAuthor; }

    public boolean isCommentAuthor() { return isCommentAuthor; }
    public void setCommentAuthor(boolean commentAuthor) { isCommentAuthor = commentAuthor; }

    public List<CommentResponse> getReplies() { return replies; }
    public void setReplies(List<CommentResponse> replies) { this.replies = replies; }
}
