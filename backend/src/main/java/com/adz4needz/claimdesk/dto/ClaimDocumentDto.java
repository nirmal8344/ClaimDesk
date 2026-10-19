package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.ClaimDocument;
import java.time.LocalDateTime;

public class ClaimDocumentDto {

    private Long id;
    private Long claimId;
    private String documentType;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private Boolean isPhoto;
    private String photoCategory;
    private String description;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadDate;
    private String reviewStatus;
    private String officerRemarks;
    private String downloadUrl;

    public ClaimDocumentDto() {}

    public static ClaimDocumentDto fromEntity(ClaimDocument d) {
        ClaimDocumentDto dto = new ClaimDocumentDto();
        dto.setId(d.getId());
        if (d.getClaim() != null) {
            dto.setClaimId(d.getClaim().getId());
        }
        dto.setDocumentType(d.getDocumentType());
        dto.setFileName(d.getFileName());
        dto.setFileSize(d.getFileSize());
        dto.setFileType(d.getFileType());
        dto.setIsPhoto(d.getIsPhoto());
        dto.setPhotoCategory(d.getPhotoCategory());
        dto.setDescription(d.getDescription());
        if (d.getUploadedBy() != null) {
            dto.setUploadedById(d.getUploadedBy().getId());
            dto.setUploadedByName(d.getUploadedBy().getFullName());
        }
        dto.setUploadDate(d.getUploadDate());
        dto.setReviewStatus(d.getReviewStatus());
        dto.setOfficerRemarks(d.getOfficerRemarks());
        dto.setDownloadUrl("/api/documents/" + d.getId() + "/download");
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Boolean getIsPhoto() { return isPhoto; }
    public void setIsPhoto(Boolean isPhoto) { this.isPhoto = isPhoto; }

    public String getPhotoCategory() { return photoCategory; }
    public void setPhotoCategory(String photoCategory) { this.photoCategory = photoCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getUploadedById() { return uploadedById; }
    public void setUploadedById(Long uploadedById) { this.uploadedById = uploadedById; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
}
