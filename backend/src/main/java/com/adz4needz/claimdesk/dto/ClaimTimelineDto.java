package com.adz4needz.claimdesk.dto;

import com.adz4needz.claimdesk.entity.ClaimTimelineEvent;
import java.time.LocalDateTime;

public class ClaimTimelineDto {

    private Long id;
    private Long claimId;
    private String eventName;
    private Long userId;
    private String userName;
    private String remarks;
    private LocalDateTime eventTime;

    public ClaimTimelineDto() {}

    public static ClaimTimelineDto fromEntity(ClaimTimelineEvent e) {
        ClaimTimelineDto dto = new ClaimTimelineDto();
        dto.setId(e.getId());
        if (e.getClaim() != null) {
            dto.setClaimId(e.getClaim().getId());
        }
        dto.setEventName(e.getEventName());
        if (e.getUser() != null) {
            dto.setUserId(e.getUser().getId());
        }
        dto.setUserName(e.getUserName());
        dto.setRemarks(e.getRemarks());
        dto.setEventTime(e.getEventTime());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClaimId() { return claimId; }
    public void setClaimId(Long claimId) { this.claimId = claimId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
}
