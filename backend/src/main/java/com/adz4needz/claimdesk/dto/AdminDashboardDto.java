package com.adz4needz.claimdesk.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminDashboardDto {

    private long totalClaims;
    private long newClaims;
    private long underReview;
    private long documentsPending;
    private long approved;
    private long rejected;
    private long settled;
    private BigDecimal totalSettlementAmount;

    private Map<String, Long> claimsByType;
    private Map<String, Long> claimsByStatus;
    private List<Map<String, Object>> monthlyClaims;
    private List<Map<String, Object>> settlementTrend;

    public AdminDashboardDto() {}

    public long getTotalClaims() { return totalClaims; }
    public void setTotalClaims(long totalClaims) { this.totalClaims = totalClaims; }

    public long getNewClaims() { return newClaims; }
    public void setNewClaims(long newClaims) { this.newClaims = newClaims; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getDocumentsPending() { return documentsPending; }
    public void setDocumentsPending(long documentsPending) { this.documentsPending = documentsPending; }

    public long getApproved() { return approved; }
    public void setApproved(long approved) { this.approved = approved; }

    public long getRejected() { return rejected; }
    public void setRejected(long rejected) { this.rejected = rejected; }

    public long getSettled() { return settled; }
    public void setSettled(long settled) { this.settled = settled; }

    public BigDecimal getTotalSettlementAmount() { return totalSettlementAmount; }
    public void setTotalSettlementAmount(BigDecimal totalSettlementAmount) { this.totalSettlementAmount = totalSettlementAmount; }

    public Map<String, Long> getClaimsByType() { return claimsByType; }
    public void setClaimsByType(Map<String, Long> claimsByType) { this.claimsByType = claimsByType; }

    public Map<String, Long> getClaimsByStatus() { return claimsByStatus; }
    public void setClaimsByStatus(Map<String, Long> claimsByStatus) { this.claimsByStatus = claimsByStatus; }

    public List<Map<String, Object>> getMonthlyClaims() { return monthlyClaims; }
    public void setMonthlyClaims(List<Map<String, Object>> monthlyClaims) { this.monthlyClaims = monthlyClaims; }

    public List<Map<String, Object>> getSettlementTrend() { return settlementTrend; }
    public void setSettlementTrend(List<Map<String, Object>> settlementTrend) { this.settlementTrend = settlementTrend; }
}
