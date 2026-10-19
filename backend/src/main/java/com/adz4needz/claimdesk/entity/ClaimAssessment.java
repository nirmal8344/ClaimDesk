package com.adz4needz.claimdesk.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_assessments")
public class ClaimAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false, unique = true)
    private Claim claim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;

    @Column(name = "assessed_loss", nullable = false, precision = 15, scale = 2)
    private BigDecimal assessedLoss;

    @Column(name = "eligible_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal eligibleAmount;

    @Column(name = "non_eligible_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal nonEligibleAmount;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 50)
    private String recommendation; // Approve, Reject

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ClaimAssessment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Claim getClaim() { return claim; }
    public void setClaim(Claim claim) { this.claim = claim; }

    public User getOfficer() { return officer; }
    public void setOfficer(User officer) { this.officer = officer; }

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
