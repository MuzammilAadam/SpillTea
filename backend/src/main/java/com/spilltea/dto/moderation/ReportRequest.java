package com.spilltea.dto.moderation;

import jakarta.validation.constraints.NotBlank;

public class ReportRequest {

    private Long storyId;
    private Long commentId;
    private Long reportedUserId;

    @NotBlank(message = "Reason for reporting is required")
    private String reason;

    public ReportRequest() {}

    public Long getStoryId() { return storyId; }
    public void setStoryId(Long storyId) { this.storyId = storyId; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
