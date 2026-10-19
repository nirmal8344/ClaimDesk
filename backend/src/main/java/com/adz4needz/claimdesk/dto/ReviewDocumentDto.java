package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewDocumentDto {

    @NotBlank(message = "Review status is required (Accepted, Rejected, Replacement Required)")
    private String status; // Accepted, Rejected, Replacement Required

    private String remarks;

    public ReviewDocumentDto() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
