package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SaveSettlementDto {

    @NotNull(message = "Settlement amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Settlement amount must be greater than zero")
    private BigDecimal settlementAmount;

    @NotNull(message = "Settlement date is required")
    private LocalDate settlementDate;

    private String settlementReference;

    @NotBlank(message = "Status is required (Pending, Processing, Completed)")
    private String status = "Completed";

    private String remarks;

    public SaveSettlementDto() {}

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
}
