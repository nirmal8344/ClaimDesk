package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.ClaimAssessment;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClaimAssessmentDto {

    private Long id;
    private Long claimId;
    private Long officerId;
    private String officerName;
    private LocalDate assessmentDate;
    private BigDecimal assessedLoss;
    private BigDecimal eligibleAmount;
    private BigDecimal nonEligibleAmount;
    private String remarks;
    private String recommendation;
    private LocalDateTime createdAt;

    public ClaimAssessmentDto() {}

    public static ClaimAssessmentDto fromEntity(ClaimAssessment a) {
        ClaimAssessmentDto dto = new ClaimAssessmentDto();
        dto.setId(a.getId());
        if (a.getClaim() != null) {
            dto.setClaimId(a.getClaim().getId());
        }
        if (a.getOfficer() != null) {
            dto.setOfficerId(a.getOfficer().getId());
            dto.setOfficerName(a.getOfficer().getFullName());
        }
        dto.setAssessmentDate(a.getAssessmentDate());
        dto.setAssessedLoss(a.getAssessedLoss());
        dto.setEligibleAmount(a.getEligibleAmount());
        dto.setNonEligibleAmount(a.getNonEligibleAmount());
        dto.setRemarks(a.getRemarks());
        dto.setRecommendation(a.getRecommendation());
        dto.setCreatedAt(a.getCreatedAt());
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
