package com.adz4needz.claimdesk.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreatePolicyDto {

    private Long customerId; // Optional for admin adding for a customer, or defaults to logged-in user

    @NotBlank(message = "Policy number is required")
    private String policyNumber;

    @NotBlank(message = "Policy type is required")
    private String policyType;

    @NotBlank(message = "Provider company is required")
    private String providerCompany;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Coverage amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Coverage amount must be positive")
    private BigDecimal coverageAmount;

    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.0", message = "Premium amount must be positive or zero")
    private BigDecimal premiumAmount;

    private String premiumTerm = "year";
    private String coverageDescription;
    private String status = "ACTIVE";

    public CreatePolicyDto() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }

    public String getPolicyType() { return policyType; }
    public void setPolicyType(String policyType) { this.policyType = policyType; }

    public String getProviderCompany() { return providerCompany; }
    public void setProviderCompany(String providerCompany) { this.providerCompany = providerCompany; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getCoverageAmount() { return coverageAmount; }
    public void setCoverageAmount(BigDecimal coverageAmount) { this.coverageAmount = coverageAmount; }

    public BigDecimal getPremiumAmount() { return premiumAmount; }
    public void setPremiumAmount(BigDecimal premiumAmount) { this.premiumAmount = premiumAmount; }

    public String getPremiumTerm() { return premiumTerm; }
    public void setPremiumTerm(String premiumTerm) { this.premiumTerm = premiumTerm; }

    public String getCoverageDescription() { return coverageDescription; }
    public void setCoverageDescription(String coverageDescription) { this.coverageDescription = coverageDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
