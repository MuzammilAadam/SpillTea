package com.spilltea.dto.letter;

import jakarta.validation.constraints.NotBlank;

public class LetterRequest {

    @NotBlank(message = "Recipient cannot be empty")
    private String recipient = "Someone";

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Letter content cannot be empty")
    private String content;

    private String category = "To My Younger Self";
    private boolean isPrivate = false;
    private String envelopeColor = "#B7B99A";
    private String stampStyle = "olive-wreath";
    private String washiColor = "#F7DDE1";
    private String paperTexture = "laid-paper";

    public LetterRequest() {}

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public String getEnvelopeColor() { return envelopeColor; }
    public void setEnvelopeColor(String envelopeColor) { this.envelopeColor = envelopeColor; }

    public String getStampStyle() { return stampStyle; }
    public void setStampStyle(String stampStyle) { this.stampStyle = stampStyle; }

    public String getWashiColor() { return washiColor; }
    public void setWashiColor(String washiColor) { this.washiColor = washiColor; }

    public String getPaperTexture() { return paperTexture; }
    public void setPaperTexture(String paperTexture) { this.paperTexture = paperTexture; }
}
