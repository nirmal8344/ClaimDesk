package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.DocumentRequest;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class RequestDocumentDto {

    private Long id;
    private Long claimId;
    private Long officerId;
    private String officerName;

    @NotBlank(message = "Document type is required")
    private String documentType;

    private Boolean isMandatory = true;

    @NotBlank(message = "Remarks/instructions are required")
    private String remarks;

    private LocalDate dueDate;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime fulfilledAt;

    public RequestDocumentDto() {}

    public static RequestDocumentDto fromEntity(DocumentRequest r) {
        RequestDocumentDto dto = new RequestDocumentDto();
        dto.setId(r.getId());
        if (r.getClaim() != null) {
            dto.setClaimId(r.getClaim().getId());
        }
        if (r.getOfficer() != null) {
            dto.setOfficerId(r.getOfficer().getId());
            dto.setOfficerName(r.getOfficer().getFullName());
        }
        dto.setDocumentType(r.getDocumentType());
        dto.setIsMandatory(r.getIsMandatory());
        dto.setRemarks(r.getRemarks());
        dto.setDueDate(r.getDueDate());
        dto.setStatus(r.getStatus());
        dto.setRequestedAt(r.getRequestedAt());
        dto.setFulfilledAt(r.getFulfilledAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }

    public String getOfficerName() { return officerName; }
    public void setOfficerName(String officerName) { this.officerName = officerName; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public Boolean getIsMandatory() { return isMandatory; }
    public void setIsMandatory(Boolean isMandatory) { this.isMandatory = isMandatory; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getFulfilledAt() { return fulfilledAt; }
    public void setFulfilledAt(LocalDateTime fulfilledAt) { this.fulfilledAt = fulfilledAt; }
}
