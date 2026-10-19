package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SaveAssessmentDto {

    @NotNull(message = "Assessment date is required")
    private LocalDate assessmentDate;

    @NotNull(message = "Assessed loss is required")
    @DecimalMin(value = "0.0", message = "Assessed loss must be non-negative")
    private BigDecimal assessedLoss;

    @NotNull(message = "Eligible amount is required")
    @DecimalMin(value = "0.0", message = "Eligible amount must be non-negative")
    private BigDecimal eligibleAmount;

    @NotNull(message = "Non-eligible amount is required")
    @DecimalMin(value = "0.0", message = "Non-eligible amount must be non-negative")
    private BigDecimal nonEligibleAmount;

    private String remarks;

    @NotBlank(message = "Recommendation is required (Approve / Reject)")
    private String recommendation; // Approve, Reject

    public SaveAssessmentDto() {}

    public LocalDate getAssessmentDate() { return assessmentDate; }
    public void setAssessmentDate(LocalDate assessmentDate) { this.assessmentDate = assessmentDate; }

    public BigDecimal getAssessedLoss() { return assessedLoss; }
    public void setAssessedLoss(BigDecimal assessedLoss) { this.assessedLoss = assessedLoss; }

    public BigDecimal getEligibleAmount() { return eligibleAmount; }
    public void setEligibleAmount(BigDecimal eligibleAmount) { this.eligibleAmount = eligibleAmount; }

    public BigDecimal getNonEligibleAmount() { return nonEligibleAmount; }
    public void setNonEligibleAmount(BigDecimal nonEligibleAmount) { this.nonEligibleAmount = nonEligibleAmount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
