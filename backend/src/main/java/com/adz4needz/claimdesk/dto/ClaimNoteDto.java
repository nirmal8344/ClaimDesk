package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.ClaimNote;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ClaimNoteDto {

    private Long id;
    private Long claimId;
    private Long userId;
    private String userName;

    @NotBlank(message = "Note cannot be empty")
    private String note;

    private Boolean isInternal = true;
    private LocalDateTime createdAt;

    public ClaimNoteDto() {}

    public static ClaimNoteDto fromEntity(ClaimNote n) {
        ClaimNoteDto dto = new ClaimNoteDto();
        dto.setId(n.getId());
        if (n.getClaim() != null) {
            dto.setClaimId(n.getClaim().getId());
        }
        if (n.getUser() != null) {
            dto.setUserId(n.getUser().getId());
        }
        dto.setUserName(n.getUserName());
        dto.setNote(n.getNote());
        dto.setIsInternal(n.getIsInternal());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
