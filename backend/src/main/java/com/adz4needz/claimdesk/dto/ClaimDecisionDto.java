package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ClaimDecisionDto {

    @NotBlank(message = "Decision is required (Approved / Rejected)")
    private String decision; // Approved, Rejected

    private BigDecimal approvedAmount;
    private String remarks;
    private String rejectionReason;

    public ClaimDecisionDto() {}

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
