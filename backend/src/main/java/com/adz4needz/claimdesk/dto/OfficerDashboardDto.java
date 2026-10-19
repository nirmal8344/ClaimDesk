package com.adz4needz.claimdesk.dto;

import java.util.List;
import java.util.Map;

public class OfficerDashboardDto {

    private long assignedClaims;
    private long pendingDocuments;
    private long underReview;
    private long assessmentPending;
    private long approvedClaims;
    private long rejectedClaims;
    private long settlementPending;
    private long newClaims;

    private List<ClaimDto> recentAssignedClaims;

    private Map<String, Long> tasksSummary;
    private Map<String, Long> statusOverview;

    public OfficerDashboardDto() {}

    public long getAssignedClaims() { return assignedClaims; }
    public void setAssignedClaims(long assignedClaims) { this.assignedClaims = assignedClaims; }

    public long getPendingDocuments() { return pendingDocuments; }
    public void setPendingDocuments(long pendingDocuments) { this.pendingDocuments = pendingDocuments; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getAssessmentPending() { return assessmentPending; }
    public void setAssessmentPending(long assessmentPending) { this.assessmentPending = assessmentPending; }

    public long getApprovedClaims() { return approvedClaims; }
    public void setApprovedClaims(long approvedClaims) { this.approvedClaims = approvedClaims; }

    public long getRejectedClaims() { return rejectedClaims; }
    public void setRejectedClaims(long rejectedClaims) { this.rejectedClaims = rejectedClaims; }

    public long getSettlementPending() { return settlementPending; }
    public void setSettlementPending(long settlementPending) { this.settlementPending = settlementPending; }

    public long getNewClaims() { return newClaims; }
    public void setNewClaims(long newClaims) { this.newClaims = newClaims; }

    public List<ClaimDto> getRecentAssignedClaims() { return recentAssignedClaims; }
    public void setRecentAssignedClaims(List<ClaimDto> recentAssignedClaims) { this.recentAssignedClaims = recentAssignedClaims; }

    public Map<String, Long> getTasksSummary() { return tasksSummary; }
    public void setTasksSummary(Map<String, Long> tasksSummary) { this.tasksSummary = tasksSummary; }

    public Map<String, Long> getStatusOverview() { return statusOverview; }
    public void setStatusOverview(Map<String, Long> statusOverview) { this.statusOverview = statusOverview; }
}
