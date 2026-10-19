package com.adz4needz.claimdesk.dto;

import java.util.List;

public class CustomerDashboardDto {

    private long activePolicies;
    private long totalClaims;
    private long underReview;
    private long settled;
    private long documentsPending;
    private long approved;

    private List<ClaimDto> recentClaims;
    private List<PolicyDto> activePoliciesList;

    public CustomerDashboardDto() {}

    public long getActivePolicies() { return activePolicies; }
    public void setActivePolicies(long activePolicies) { this.activePolicies = activePolicies; }

    public long getTotalClaims() { return totalClaims; }
    public void setTotalClaims(long totalClaims) { this.totalClaims = totalClaims; }

    public long getUnderReview() { return underReview; }
    public void setUnderReview(long underReview) { this.underReview = underReview; }

    public long getSettled() { return settled; }
    public void setSettled(long settled) { this.settled = settled; }

    public long getDocumentsPending() { return documentsPending; }
    public void setDocumentsPending(long documentsPending) { this.documentsPending = documentsPending; }

    public long getApproved() { return approved; }
    public void setApproved(long approved) { this.approved = approved; }

    public List<ClaimDto> getRecentClaims() { return recentClaims; }
    public void setRecentClaims(List<ClaimDto> recentClaims) { this.recentClaims = recentClaims; }

    public List<PolicyDto> getActivePoliciesList() { return activePoliciesList; }
    public void setActivePoliciesList(List<PolicyDto> activePoliciesList) { this.activePoliciesList = activePoliciesList; }
}
