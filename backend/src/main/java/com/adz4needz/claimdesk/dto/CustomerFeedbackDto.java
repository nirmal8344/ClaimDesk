package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.CustomerFeedback;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CustomerFeedbackDto {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long claimId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private String comments;
    private LocalDateTime createdAt;

    public CustomerFeedbackDto() {}

    public static CustomerFeedbackDto fromEntity(CustomerFeedback f) {
        CustomerFeedbackDto dto = new CustomerFeedbackDto();
        dto.setId(f.getId());
        if (f.getCustomer() != null) {
            dto.setCustomerId(f.getCustomer().getId());
            dto.setCustomerName(f.getCustomer().getFullName());
        }
        if (f.getClaim() != null) {
            dto.setClaimId(f.getClaim().getId());
        }
        dto.setRating(f.getRating());
        dto.setComments(f.getComments());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
