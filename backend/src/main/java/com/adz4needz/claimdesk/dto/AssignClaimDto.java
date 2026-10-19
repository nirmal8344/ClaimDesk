package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.NotNull;

public class AssignClaimDto {

    @NotNull(message = "Officer ID is required")
    private Long officerId;

    private String priority = "Medium";
    private String remarks;

    public AssignClaimDto() {}

    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
