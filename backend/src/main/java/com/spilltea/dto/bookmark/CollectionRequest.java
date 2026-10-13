package com.spilltea.dto.bookmark;

import jakarta.validation.constraints.NotBlank;

public class CollectionRequest {

    @NotBlank(message = "Collection name cannot be empty")
    private String name;

    private String description;
    private boolean isPrivate = false;

    public CollectionRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }
}
