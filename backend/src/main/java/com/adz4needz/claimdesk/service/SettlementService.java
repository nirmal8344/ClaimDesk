package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.SaveSettlementDto;
import com.adz4needz.claimdesk.dto.SettlementDto;
import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final ClaimRepository claimRepository;
    private final ClaimDecisionRepository decisionRepository;
    private final UserRepository userRepository;
    private final ClaimTimelineEventRepository timelineRepository;
    private final NotificationRepository notificationRepository;

    public SettlementService(SettlementRepository settlementRepository,
                             ClaimRepository claimRepository,
                             ClaimDecisionRepository decisionRepository,
                             UserRepository userRepository,
                             ClaimTimelineEventRepository timelineRepository,
                             NotificationRepository notificationRepository) {
        this.settlementRepository = settlementRepository;
        this.claimRepository = claimRepository;
        this.decisionRepository = decisionRepository;
        this.userRepository = userRepository;
        this.timelineRepository = timelineRepository;
        this.notificationRepository = notificationRepository;
    }

    public Optional<SettlementDto> getSettlementByClaimId(Long claimId) {
        return settlementRepository.findByClaimId(claimId)
                .map(SettlementDto::fromEntity);
    }

    public List<SettlementDto> getAllSettlements() {
        return settlementRepository.findAll().stream()
                .map(SettlementDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SettlementDto recordSettlement(Long claimId, Long recorderId, SaveSettlementDto dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User recorder = userRepository.findById(recorderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + recorderId));

        if (!"Approved".equalsIgnoreCase(claim.getStatus()) && !"Settlement Processing".equalsIgnoreCase(claim.getStatus()) && !"Settled".equalsIgnoreCase(claim.getStatus())) {
            throw new BadRequestException("Settlement cannot be processed for unapproved claim (Current status: " + claim.getStatus() + ")");
        }

        BigDecimal approvedAmt = claim.getRequestedAmount();
        Optional<ClaimDecision> decisionOpt = decisionRepository.findByClaimId(claimId);
        if (decisionOpt.isPresent() && decisionOpt.get().getApprovedAmount() != null) {
            approvedAmt = decisionOpt.get().getApprovedAmount();
        }

        Settlement settlement = settlementRepository.findByClaimId(claimId)
                .orElse(new Settlement());

        settlement.setClaim(claim);
        settlement.setApprovedAmount(approvedAmt);
        settlement.setSettlementAmount(dto.getSettlementAmount());
        settlement.setSettlementDate(dto.getSettlementDate());

        String ref = dto.getSettlementReference();
        if (ref == null || ref.isBlank()) {
            ref = "SETTL-" + (2024 + System.currentTimeMillis() % 10000);
        }
        settlement.setSettlementReference(ref);
        settlement.setStatus(dto.getStatus() != null ? dto.getStatus() : "Completed");
        settlement.setRemarks(dto.getRemarks());

        Settlement saved = settlementRepository.save(settlement);

        // Update claim status
        if ("Completed".equalsIgnoreCase(settlement.getStatus())) {
            claim.setStatus("Settled");
        } else {
            claim.setStatus("Settlement Processing");
        }
        claimRepository.save(claim);

        // Timeline event
        String eventName = "Settled".equalsIgnoreCase(claim.getStatus()) ? "Settled" : "Settlement Processing";
        timelineRepository.save(new ClaimTimelineEvent(
                claim,
                eventName,
                recorder,
                recorder.getFullName(),
                "Settlement amount: ₹" + dto.getSettlementAmount() + ", Ref: " + ref + " (" + settlement.getStatus() + ")"
        ));

        // Notify customer
        if (claim.getCustomer() != null && "Completed".equalsIgnoreCase(settlement.getStatus())) {
            notificationRepository.save(new Notification(
                    claim.getCustomer(),
                    "Claim settled",
                    claim.getClaimNumber() + " has been settled. Amount: ₹" + dto.getSettlementAmount(),
                    "SETTLEMENT",
                    "/customer/claims/" + claim.getId()
            ));
        }

        return SettlementDto.fromEntity(saved);
    }
}
