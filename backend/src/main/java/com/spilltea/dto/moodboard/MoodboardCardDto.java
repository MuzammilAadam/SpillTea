package com.spilltea.dto.moodboard;

public class MoodboardCardDto {
    private String id;
    private String type; // PHOTO, QUOTE, NOTE, TEXT, RITUAL, COLLECTION, DECORATION, or image, note, quote
    private String title;
    private String content;
    private String image;
    private String author;
    private String time;
    private String mood;
    private String rotation = "rotate-0";
    private Boolean washiTape = false;
    private String washiColor;
    private String color;
    private Boolean paperClip = false;
    private Boolean pressedFlower = false;
    private Double positionX = 0.0;
    private Double positionY = 0.0;
    private Double width;
    private Double height;
    private Integer displayOrder = 0;
    private String visibility = "PUBLIC";

    public MoodboardCardDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getRotation() { return rotation; }
    public void setRotation(String rotation) { this.rotation = rotation; }

    public Boolean getWashiTape() { return washiTape; }
    public void setWashiTape(Boolean washiTape) { this.washiTape = washiTape; }

    public String getWashiColor() { return washiColor; }
    public void setWashiColor(String washiColor) { this.washiColor = washiColor; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getPaperClip() { return paperClip; }
    public void setPaperClip(Boolean paperClip) { this.paperClip = paperClip; }

    public Boolean getPressedFlower() { return pressedFlower; }
    public void setPressedFlower(Boolean pressedFlower) { this.pressedFlower = pressedFlower; }

    public Double getPositionX() { return positionX; }
    public void setPositionX(Double positionX) { this.positionX = positionX; }

    public Double getPositionY() { return positionY; }
    public void setPositionY(Double positionY) { this.positionY = positionY; }

    public Double getWidth() { return width; }
    public void setWidth(Double width) { this.width = width; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}
