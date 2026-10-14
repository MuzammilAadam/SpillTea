package com.spilltea.dto.upload;

public class UploadResponse {
    private Long id;
    private String url;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String createdAt;

    public UploadResponse() {}

    public UploadResponse(Long id, String url, String originalFilename, String contentType, Long fileSize, String createdAt) {
        this.id = id;
        this.url = url;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
