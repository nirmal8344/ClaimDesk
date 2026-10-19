package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.Policy;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PolicyDto {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String policyNumber;
    private String policyType;
    private String providerCompany;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal coverageAmount;
    private BigDecimal premiumAmount;
    private String premiumTerm;
    private String coverageDescription;
    private String status;
    private LocalDateTime createdAt;

    public PolicyDto() {}

    public static PolicyDto fromEntity(Policy p) {
        PolicyDto dto = new PolicyDto();
        dto.setId(p.getId());
        if (p.getCustomer() != null) {
            dto.setCustomerId(p.getCustomer().getId());
            dto.setCustomerName(p.getCustomer().getFullName());
            dto.setCustomerEmail(p.getCustomer().getEmail());
        }
        dto.setPolicyNumber(p.getPolicyNumber());
        dto.setPolicyType(p.getPolicyType());
        dto.setProviderCompany(p.getProviderCompany());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        dto.setCoverageAmount(p.getCoverageAmount());
        dto.setPremiumAmount(p.getPremiumAmount());
        dto.setPremiumTerm(p.getPremiumTerm());
        dto.setCoverageDescription(p.getCoverageDescription());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
