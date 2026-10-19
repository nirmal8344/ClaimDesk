package com.adz4needz.claimdesk.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_notes")
public class ClaimNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_name", length = 150)
    private String userName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_internal")
    private Boolean isInternal = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public ClaimNote() {}

    public ClaimNote(Claim claim, User user, String userName, String note, Boolean isInternal) {
        this.claim = claim;
        this.user = user;
        this.userName = userName;
        this.note = note;
        this.isInternal = isInternal;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Claim getClaim() { return claim; }
    public void setClaim(Claim claim) { this.claim = claim; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
