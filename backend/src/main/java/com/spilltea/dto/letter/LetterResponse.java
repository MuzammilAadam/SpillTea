package com.spilltea.dto.letter;

public class LetterResponse {
    private String id;
    private String recipient;
    private String title;
    private String content;
    private String date;
    private String category;
    private boolean isPrivate;
    private String envelopeColor;
    private String stampStyle;
    private String washiColor;
    private String paperTexture;
    private String authorPseudonym;
    private boolean isAuthor;

    public LetterResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

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

    public String getAuthorPseudonym() { return authorPseudonym; }
    public void setAuthorPseudonym(String authorPseudonym) { this.authorPseudonym = authorPseudonym; }

    public boolean isAuthor() { return isAuthor; }
    public void setAuthor(boolean author) { isAuthor = author; }
}
