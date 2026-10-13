package com.spilltea.dto.bookmark;

public class CollectionResponse {
    private Long id;
    private String name;
    private String description;
    private boolean isPrivate;
    private long itemsCount = 0;
    private String createdAt;

    public CollectionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public long getItemsCount() { return itemsCount; }
    public void setItemsCount(long itemsCount) { this.itemsCount = itemsCount; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
