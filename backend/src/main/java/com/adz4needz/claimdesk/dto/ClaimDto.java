package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.Claim;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClaimDto {

    private Long id;
    private String claimNumber;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;

    private Long policyId;
    private String policyNumber;
    private String policyType;
    private String providerCompany;
    private BigDecimal policyCoverage;
    private LocalDate policyEndDate;

    private String claimType;
    private String incidentTitle;
    private LocalDate incidentDate;
    private String incidentLocation;
    private String incidentDescription;
    private BigDecimal estimatedLoss;
    private BigDecimal requestedAmount;
    private String additionalRemarks;
    private String status;
    private String priority;

    private Long assignedOfficerId;
    private String assignedOfficerName;
    private String assignedOfficerEmail;
    private LocalDateTime assignedDate;
    private String assignmentRemarks;

    private String rejectionReason;
    private String rejectionRemarks;
    private LocalDateTime rejectionDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional computed fields for screens
    private int documentsCount;
    private int photosCount;
    private int daysInReview;
    private boolean isAssessed;
    private BigDecimal assessedAmount;
    private BigDecimal eligibleAmount;
    private BigDecimal settledAmount;
    private String settlementStatus;
    private String settlementReference;

    public ClaimDto() {}

    public static ClaimDto fromEntity(Claim c) {
        ClaimDto dto = new ClaimDto();
        dto.setId(c.getId());
        dto.setClaimNumber(c.getClaimNumber());

        if (c.getCustomer() != null) {
            dto.setCustomerId(c.getCustomer().getId());
            dto.setCustomerName(c.getCustomer().getFullName());
            dto.setCustomerEmail(c.getCustomer().getEmail());
            dto.setCustomerPhone(c.getCustomer().getPhoneNumber());
            dto.setCustomerAddress(c.getCustomer().getAddress());
        }

        if (c.getPolicy() != null) {
            dto.setPolicyId(c.getPolicy().getId());
            dto.setPolicyNumber(c.getPolicy().getPolicyNumber());
            dto.setPolicyType(c.getPolicy().getPolicyType());
            dto.setProviderCompany(c.getPolicy().getProviderCompany());
            dto.setPolicyCoverage(c.getPolicy().getCoverageAmount());
            dto.setPolicyEndDate(c.getPolicy().getEndDate());
        }

        dto.setClaimType(c.getClaimType());
        dto.setIncidentTitle(c.getIncidentTitle());
        dto.setIncidentDate(c.getIncidentDate());
        dto.setIncidentLocation(c.getIncidentLocation());
        dto.setIncidentDescription(c.getIncidentDescription());
        dto.setEstimatedLoss(c.getEstimatedLoss());
        dto.setRequestedAmount(c.getRequestedAmount());
        dto.setAdditionalRemarks(c.getAdditionalRemarks());
        dto.setStatus(c.getStatus());
        dto.setPriority(c.getPriority());

        if (c.getAssignedOfficer() != null) {
            dto.setAssignedOfficerId(c.getAssignedOfficer().getId());
            dto.setAssignedOfficerName(c.getAssignedOfficer().getFullName());
            dto.setAssignedOfficerEmail(c.getAssignedOfficer().getEmail());
            dto.setAssignedDate(c.getAssignedDate());
            dto.setAssignmentRemarks(c.getAssignmentRemarks());
        }

        dto.setRejectionReason(c.getRejectionReason());
        dto.setRejectionRemarks(c.getRejectionRemarks());
        dto.setRejectionDate(c.getRejectionDate());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public Long getPolicyId() { return policyId; }
    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getPolicyType() { return policyType; }
    public void setPolicyType(String policyType) { this.policyType = policyType; }

    public String getProviderCompany() { return providerCompany; }
    public void setProviderCompany(String providerCompany) { this.providerCompany = providerCompany; }

    public BigDecimal getPolicyCoverage() { return policyCoverage; }
    public void setPolicyCoverage(BigDecimal policyCoverage) { this.policyCoverage = policyCoverage; }

    public LocalDate getPolicyEndDate() { return policyEndDate; }
    public void setPolicyEndDate(LocalDate policyEndDate) { this.policyEndDate = policyEndDate; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getAssignedOfficerId() { return assignedOfficerId; }
    public void setAssignedOfficerId(Long assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }

    public String getAssignedOfficerName() { return assignedOfficerName; }
    public void setAssignedOfficerName(String assignedOfficerName) { this.assignedOfficerName = assignedOfficerName; }

    public String getAssignedOfficerEmail() { return assignedOfficerEmail; }
    public void setAssignedOfficerEmail(String assignedOfficerEmail) { this.assignedOfficerEmail = assignedOfficerEmail; }

    public LocalDateTime getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDateTime assignedDate) { this.assignedDate = assignedDate; }

    public String getAssignmentRemarks() { return assignmentRemarks; }
    public void setAssignmentRemarks(String assignmentRemarks) { this.assignmentRemarks = assignmentRemarks; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRejectionRemarks() { return rejectionRemarks; }
    public void setRejectionRemarks(String rejectionRemarks) { this.rejectionRemarks = rejectionRemarks; }

    public LocalDateTime getRejectionDate() { return rejectionDate; }
    public void setRejectionDate(LocalDateTime rejectionDate) { this.rejectionDate = rejectionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public int getDocumentsCount() { return documentsCount; }
    public void setDocumentsCount(int documentsCount) { this.documentsCount = documentsCount; }

    public int getPhotosCount() { return photosCount; }
    public void setPhotosCount(int photosCount) { this.photosCount = photosCount; }

    public int getDaysInReview() { return daysInReview; }
    public void setDaysInReview(int daysInReview) { this.daysInReview = daysInReview; }

    public boolean isAssessed() { return isAssessed; }
    public void setAssessed(boolean assessed) { isAssessed = assessed; }

    public BigDecimal getAssessedAmount() { return assessedAmount; }
    public void setAssessedAmount(BigDecimal assessedAmount) { this.assessedAmount = assessedAmount; }

    public BigDecimal getEligibleAmount() { return eligibleAmount; }
    public void setEligibleAmount(BigDecimal eligibleAmount) { this.eligibleAmount = eligibleAmount; }

    public BigDecimal getSettledAmount() { return settledAmount; }
    public void setSettledAmount(BigDecimal settledAmount) { this.settledAmount = settledAmount; }

    public String getSettlementStatus() { return settlementStatus; }
    public void setSettlementStatus(String settlementStatus) { this.settlementStatus = settlementStatus; }

    public String getSettlementReference() { return settlementReference; }
    public void setSettlementReference(String settlementReference) { this.settlementReference = settlementReference; }
}
