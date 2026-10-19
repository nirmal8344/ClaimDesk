package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.ClaimDecisionDto;
import com.adz4needz.claimdesk.dto.ClaimDto;
import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class DecisionService {

    private final ClaimDecisionRepository decisionRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ClaimTimelineEventRepository timelineRepository;
    private final NotificationRepository notificationRepository;
    private final ClaimService claimService;

    public DecisionService(ClaimDecisionRepository decisionRepository,
                           ClaimRepository claimRepository,
                           UserRepository userRepository,
                           ClaimTimelineEventRepository timelineRepository,
                           NotificationRepository notificationRepository,
                           ClaimService claimService) {
        this.decisionRepository = decisionRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.timelineRepository = timelineRepository;
        this.notificationRepository = notificationRepository;
        this.claimService = claimService;
    }

    @Transactional
    public ClaimDto recordDecision(Long claimId, Long deciderId, ClaimDecisionDto dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User decider = userRepository.findById(deciderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + deciderId));

        if ("Closed".equalsIgnoreCase(claim.getStatus()) || "Settled".equalsIgnoreCase(claim.getStatus())) {
            throw new BadRequestException("Cannot change decision on settled or closed claim");
        }

        boolean isApproved = "Approved".equalsIgnoreCase(dto.getDecision());

        ClaimDecision decision = decisionRepository.findByClaimId(claimId)
                .orElse(new ClaimDecision());

        decision.setClaim(claim);
        decision.setDecidedBy(decider);
        decision.setDecision(isApproved ? "Approved" : "Rejected");
        decision.setDecisionDate(LocalDateTime.now());
        decision.setRemarks(dto.getRemarks());

        if (isApproved) {
            BigDecimal approvedAmt = (dto.getApprovedAmount() != null) ? dto.getApprovedAmount() : claim.getRequestedAmount();
            decision.setApprovedAmount(approvedAmt);
            claim.setStatus("Approved");
            claim.setRejectionReason(null);
            claim.setRejectionRemarks(null);
        } else {
            decision.setApprovedAmount(BigDecimal.ZERO);
            decision.setRejectionReason(dto.getRejectionReason());
            claim.setStatus("Rejected");
            claim.setRejectionReason(dto.getRejectionReason());
            claim.setRejectionRemarks(dto.getRemarks());
            claim.setRejectionDate(LocalDateTime.now());
        }

        decisionRepository.save(decision);
        Claim savedClaim = claimRepository.save(claim);

        // Record timeline
        String eventTitle = isApproved ? "Claim Approved" : "Claim Rejected";
        String details = isApproved
                ? "Claim approved for ₹" + decision.getApprovedAmount() + ". " + (dto.getRemarks() != null ? dto.getRemarks() : "")
                : "Claim rejected. Reason: " + dto.getRejectionReason() + ". " + (dto.getRemarks() != null ? dto.getRemarks() : "");

        timelineRepository.save(new ClaimTimelineEvent(
                savedClaim,
                eventTitle,
                decider,
                decider.getFullName(),
                details
        ));

        // Notify customer
        if (savedClaim.getCustomer() != null) {
            notificationRepository.save(new Notification(
                    savedClaim.getCustomer(),
                    eventTitle,
                    savedClaim.getClaimNumber() + " has been " + (isApproved ? "approved." : "rejected. Reason: " + dto.getRejectionReason()),
                    "CLAIM",
                    "/customer/claims/" + savedClaim.getId()
            ));
        }

        return claimService.enrichClaimDto(savedClaim);
    }
}
