package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.Settlement;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SettlementDto {

    private Long id;
    private Long claimId;
    private String claimNumber;
    private BigDecimal approvedAmount;
    private BigDecimal settlementAmount;
    private LocalDate settlementDate;
    private String settlementReference;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SettlementDto() {}

    public static SettlementDto fromEntity(Settlement s) {
        SettlementDto dto = new SettlementDto();
        dto.setId(s.getId());
        if (s.getClaim() != null) {
            dto.setClaimId(s.getClaim().getId());
            dto.setClaimNumber(s.getClaim().getClaimNumber());
        }
        dto.setApprovedAmount(s.getApprovedAmount());
        dto.setSettlementAmount(s.getSettlementAmount());
        dto.setSettlementDate(s.getSettlementDate());
        dto.setSettlementReference(s.getSettlementReference());
        dto.setStatus(s.getStatus());
        dto.setRemarks(s.getRemarks());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }

    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(BigDecimal approvedAmount) { this.approvedAmount = approvedAmount; }

    public BigDecimal getSettlementAmount() { return settlementAmount; }
    public void setSettlementAmount(BigDecimal settlementAmount) { this.settlementAmount = settlementAmount; }

    public LocalDate getSettlementDate() { return settlementDate; }
    public void setSettlementDate(LocalDate settlementDate) { this.settlementDate = settlementDate; }

    public String getSettlementReference() { return settlementReference; }
    public void setSettlementReference(String settlementReference) { this.settlementReference = settlementReference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
