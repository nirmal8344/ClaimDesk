package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreateClaimDto {

    private Long claimId; // For updating existing draft

    @NotNull(message = "Policy is required")
    private Long policyId;

    @NotBlank(message = "Claim type is required")
    private String claimType;

    @NotBlank(message = "Incident title is required")
    private String incidentTitle;

    @NotNull(message = "Incident date is required")
    private LocalDate incidentDate;

    @NotBlank(message = "Incident location is required")
    private String incidentLocation;

    @NotBlank(message = "Incident description is required")
    private String incidentDescription;

    @NotNull(message = "Estimated loss is required")
    @DecimalMin(value = "0.0", message = "Estimated loss must be positive")
    private BigDecimal estimatedLoss;

    @NotNull(message = "Requested claim amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Requested claim amount must be greater than zero")
    private BigDecimal requestedAmount;

    private String additionalRemarks;
    private Boolean isDraft = false;

    // Optional list of temporary document IDs uploaded before final submission
    private List<Long> attachedDocumentIds;

    public CreateClaimDto() {}

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public String getClaimType() { return claimType; }
    public void setClaimType(String claimType) { this.claimType = claimType; }

    public String getIncidentTitle() { return incidentTitle; }
    public void setIncidentTitle(String incidentTitle) { this.incidentTitle = incidentTitle; }

    public LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(LocalDate incidentDate) { this.incidentDate = incidentDate; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public String getIncidentDescription() { return incidentDescription; }
    public void setIncidentDescription(String incidentDescription) { this.incidentDescription = incidentDescription; }

    public BigDecimal getEstimatedLoss() { return estimatedLoss; }
    public void setEstimatedLoss(BigDecimal estimatedLoss) { this.estimatedLoss = estimatedLoss; }

    public BigDecimal getRequestedAmount() { return requestedAmount; }
    public void setRequestedAmount(BigDecimal requestedAmount) { this.requestedAmount = requestedAmount; }

    public String getAdditionalRemarks() { return additionalRemarks; }
    public void setAdditionalRemarks(String additionalRemarks) { this.additionalRemarks = additionalRemarks; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean isDraft) { this.isDraft = isDraft; }

    public List<Long> getAttachedDocumentIds() { return attachedDocumentIds; }
    public void setAttachedDocumentIds(List<Long> attachedDocumentIds) { this.attachedDocumentIds = attachedDocumentIds; }
}
