package com.spilltea.dto.moderation;

import jakarta.validation.constraints.NotBlank;

public class ModerationActionRequest {

    @NotBlank(message = "Action is required")
    private String action; // RESOLVE, REJECT, ESCALATE, HIDE_CONTENT, SUSPEND_USER

    private String moderatorNotes;

    public ModerationActionRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getModeratorNotes() { return moderatorNotes; }
    public void setModeratorNotes(String moderatorNotes) { this.moderatorNotes = moderatorNotes; }
}
