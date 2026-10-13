package com.spilltea.dto.moderation;

public class ReportResponse {
    private Long id;
    private String reporterPseudonym;
    private String reportedPseudonym;
    private Long storyId;
    private String storyTitle;
    private Long commentId;
    private String commentSnippet;
    private String reason;
    private String status;
    private String moderatorNotes;
    private String createdAt;

    public ReportResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReporterPseudonym() { return reporterPseudonym; }
    public void setReporterPseudonym(String reporterPseudonym) { this.reporterPseudonym = reporterPseudonym; }

    public String getReportedPseudonym() { return reportedPseudonym; }
    public void setReportedPseudonym(String reportedPseudonym) { this.reportedPseudonym = reportedPseudonym; }

    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }

    public String getStoryTitle() { return storyTitle; }
    public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public String getCommentSnippet() { return commentSnippet; }
    public void setCommentSnippet(String commentSnippet) { this.commentSnippet = commentSnippet; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getModeratorNotes() { return moderatorNotes; }
    public void setModeratorNotes(String moderatorNotes) { this.moderatorNotes = moderatorNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
