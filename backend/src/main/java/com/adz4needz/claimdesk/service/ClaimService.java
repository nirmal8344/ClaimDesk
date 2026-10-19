package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.*;
import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.exception.UnauthorizedException;
import com.adz4needz.claimdesk.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final ClaimTimelineEventRepository timelineRepository;
    private final ClaimNoteRepository noteRepository;
    private final ClaimDocumentRepository documentRepository;
    private final ClaimAssessmentRepository assessmentRepository;
    private final SettlementRepository settlementRepository;
    private final NotificationRepository notificationRepository;

    public ClaimService(ClaimRepository claimRepository,
                        PolicyRepository policyRepository,
                        UserRepository userRepository,
                        ClaimTimelineEventRepository timelineRepository,
                        ClaimNoteRepository noteRepository,
                        ClaimDocumentRepository documentRepository,
                        ClaimAssessmentRepository assessmentRepository,
                        SettlementRepository settlementRepository,
                        NotificationRepository notificationRepository) {
        this.claimRepository = claimRepository;
        this.policyRepository = policyRepository;
        this.userRepository = userRepository;
        this.timelineRepository = timelineRepository;
        this.noteRepository = noteRepository;
        this.documentRepository = documentRepository;
        this.assessmentRepository = assessmentRepository;
        this.settlementRepository = settlementRepository;
        this.notificationRepository = notificationRepository;
    }

    public synchronized String generateUniqueClaimNumber() {
        long count = claimRepository.count() + 1005;
        String claimNum = "CLM-" + count;
        while (claimRepository.existsByClaimNumber(claimNum)) {
            count++;
            claimNum = "CLM-" + count;
        }
        return claimNum;
    }

    @Transactional
    public ClaimDto createClaim(Long customerId, CreateClaimDto dto) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Policy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + dto.getPolicyId()));

        if (!policy.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("You can only file claims against your own policies");
        }

        if ("CANCELLED".equalsIgnoreCase(policy.getStatus())) {
            throw new BadRequestException("Cannot file a claim against a cancelled policy");
        }

        if (dto.getRequestedAmount().compareTo(policy.getCoverageAmount()) > 0) {
            throw new BadRequestException("Requested amount cannot exceed policy coverage amount of " + policy.getCoverageAmount());
        }

        Claim claim;
        boolean isNew = true;
        if (dto.getClaimId() != null) {
            claim = claimRepository.findById(dto.getClaimId())
                    .orElseThrow(() -> new ResourceNotFoundException("Draft claim not found"));
            if (!claim.getCustomer().getId().equals(customerId)) {
                throw new UnauthorizedException("Cannot edit another user's claim");
            }
            if (!"Draft".equalsIgnoreCase(claim.getStatus())) {
                throw new BadRequestException("Only draft claims can be edited directly");
            }
            isNew = false;
        } else {
            claim = new Claim();
            claim.setClaimNumber(generateUniqueClaimNumber());
            claim.setCustomer(customer);
        }

        claim.setPolicy(policy);
        claim.setClaimType(dto.getClaimType());
        claim.setIncidentTitle(dto.getIncidentTitle());
        claim.setIncidentDate(dto.getIncidentDate());
        claim.setIncidentLocation(dto.getIncidentLocation());
        claim.setIncidentDescription(dto.getIncidentDescription());
        claim.setEstimatedLoss(dto.getEstimatedLoss());
        claim.setRequestedAmount(dto.getRequestedAmount());
        claim.setAdditionalRemarks(dto.getAdditionalRemarks());

        if (Boolean.TRUE.equals(dto.getIsDraft())) {
            claim.setStatus("Draft");
        } else {
            claim.setStatus("Submitted");
        }

        Claim saved = claimRepository.save(claim);

        // Link any uploaded documents that were passed in dto
        if (dto.getAttachedDocumentIds() != null && !dto.getAttachedDocumentIds().isEmpty()) {
            for (Long docId : dto.getAttachedDocumentIds()) {
                documentRepository.findById(docId).ifPresent(doc -> {
                    doc.setClaim(saved);
                    documentRepository.save(doc);
                });
            }
        }

        // Add timeline event
        if (Boolean.TRUE.equals(dto.getIsDraft())) {
            timelineRepository.save(new ClaimTimelineEvent(
                    saved, "Claim Draft Saved", customer, customer.getFullName(), "Customer saved claim draft"
            ));
        } else {
            timelineRepository.save(new ClaimTimelineEvent(
                    saved, "Claim Submitted", customer, customer.getFullName(), "Claim submitted by customer"
            ));

            // Create notification for customer
            notificationRepository.save(new Notification(
                    customer,
                    "Claim submitted successfully",
                    "Your claim " + saved.getClaimNumber() + " has been submitted and is queued for officer assignment.",
                    "CLAIM",
                    "/customer/claims/" + saved.getId()
            ));

            // Notify Admin
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                notificationRepository.save(new Notification(
                        admin,
                        "New claim submitted",
                        saved.getClaimNumber() + " - " + customer.getFullName() + " - " + saved.getClaimType(),
                        "CLAIM",
                        "/admin/claims/" + saved.getId()
                ));
            }
        }

        return enrichClaimDto(saved);
    }

    @Transactional
    public ClaimDto submitDraftClaim(Long claimId, Long customerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        if (!claim.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedException("Cannot submit another user's claim");
        }

        if (!"Draft".equalsIgnoreCase(claim.getStatus())) {
            throw new BadRequestException("Claim is already submitted");
        }

        claim.setStatus("Submitted");
        Claim saved = claimRepository.save(claim);

        User customer = claim.getCustomer();
        timelineRepository.save(new ClaimTimelineEvent(
                saved, "Claim Submitted", customer, customer.getFullName(), "Claim draft submitted by customer"
        ));

        notificationRepository.save(new Notification(
                customer,
                "Claim submitted successfully",
                "Your claim " + saved.getClaimNumber() + " has been submitted for review.",
                "CLAIM",
                "/customer/claims/" + saved.getId()
        ));

        return enrichClaimDto(saved);
    }

    public Claim validateClaimAccess(Long claimId, Long currentUserId, Role currentUserRole) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        if (currentUserRole == Role.CUSTOMER) {
            if (claim.getCustomer() == null || !claim.getCustomer().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Access denied: You can only access your own claims");
            }
        } else if (currentUserRole == Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(currentUserId)) {
                throw new UnauthorizedException("Access denied: Claim is not assigned to you");
            }
        }
        return claim;
    }

    public ClaimDto getClaimById(Long claimId, Long currentUserId, Role currentUserRole) {
        Claim claim = validateClaimAccess(claimId, currentUserId, currentUserRole);
        return enrichClaimDto(claim);
    }

    public Page<ClaimDto> getCustomerClaims(Long customerId, String status, String search, Pageable pageable) {
        String filterStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status : null;
        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.toLowerCase().trim() + "%" : null;
        return claimRepository.findCustomerClaims(customerId, filterStatus, searchPattern, pageable)
                .map(this::enrichClaimDto);
    }

    public Page<ClaimDto> getOfficerClaims(Long officerId, String status, String priority, String claimType, String search, Pageable pageable) {
        String filterStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status : null;
        String filterPriority = (priority != null && !priority.isBlank() && !"ALL".equalsIgnoreCase(priority)) ? priority : null;
        String filterType = (claimType != null && !claimType.isBlank() && !"ALL".equalsIgnoreCase(claimType)) ? claimType : null;
        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.toLowerCase().trim() + "%" : null;

        return claimRepository.findOfficerClaims(officerId, filterStatus, filterPriority, filterType, searchPattern, pageable)
                .map(this::enrichClaimDto);
    }

    public Page<ClaimDto> getAllClaimsAdmin(Long customerId, Long officerId, String status, String priority,
                                            String claimType, LocalDate startDate, LocalDate endDate,
                                            String search, Pageable pageable) {
        String filterStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status : null;
        String filterPriority = (priority != null && !priority.isBlank() && !"ALL".equalsIgnoreCase(priority)) ? priority : null;
        String filterType = (claimType != null && !claimType.isBlank() && !"ALL".equalsIgnoreCase(claimType)) ? claimType : null;
        String searchPattern = (search != null && !search.isBlank()) ? "%" + search.toLowerCase().trim() + "%" : null;

        return claimRepository.filterClaims(customerId, officerId, filterStatus, filterPriority, filterType, startDate, endDate, searchPattern, pageable)
                .map(this::enrichClaimDto);
    }

    @Transactional
    public ClaimDto assignClaim(Long claimId, Long adminId, AssignClaimDto dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));

        User officer = userRepository.findById(dto.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + dto.getOfficerId()));

        if (officer.getRole() != Role.CLAIM_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new BadRequestException("Assigned user must be a Claim Officer");
        }

        if ("INACTIVE".equalsIgnoreCase(officer.getStatus())) {
            throw new BadRequestException("Cannot assign claim to an inactive officer");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        claim.setAssignedOfficer(officer);
        claim.setAssignedDate(LocalDateTime.now());
        claim.setAssignmentRemarks(dto.getRemarks());
        if (dto.getPriority() != null) {
            claim.setPriority(dto.getPriority());
        }

        if ("Submitted".equalsIgnoreCase(claim.getStatus()) || "Draft".equalsIgnoreCase(claim.getStatus())) {
            claim.setStatus("Under Review");
        }

        Claim saved = claimRepository.save(claim);

        // Timeline event
        timelineRepository.save(new ClaimTimelineEvent(
                saved,
                "Assigned to Officer",
                admin,
                admin.getFullName(),
                "Assigned to Officer " + officer.getFullName() + (dto.getRemarks() != null ? " - " + dto.getRemarks() : "")
        ));

        // Notify officer
        notificationRepository.save(new Notification(
                officer,
                "New claim assigned to you",
                saved.getClaimNumber() + " - " + saved.getClaimType(),
                "ASSIGNMENT",
                "/officer/claims/" + saved.getId()
        ));

        // Notify customer
        if (saved.getCustomer() != null) {
            notificationRepository.save(new Notification(
                    saved.getCustomer(),
                    "Claim assigned to officer",
                    saved.getClaimNumber() + " has been assigned to " + officer.getFullName() + " for processing.",
                    "CLAIM",
                    "/customer/claims/" + saved.getId()
            ));
        }

        return enrichClaimDto(saved);
    }

    @Transactional
    public ClaimDto updateClaimStatus(Long claimId, Long userId, String newStatus, String remarks) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(userId)) {
                throw new UnauthorizedException("Access denied: You can only update claims assigned to you");
            }
            if ("Approved".equalsIgnoreCase(newStatus) || "Settled".equalsIgnoreCase(newStatus)) {
                throw new BadRequestException("Officers cannot approve or settle claims directly. Please submit an assessment and recommendation for admin review.");
            }
        }

        if ("Closed".equalsIgnoreCase(claim.getStatus())) {
            throw new BadRequestException("Closed claims cannot be modified");
        }

        String oldStatus = claim.getStatus();
        claim.setStatus(newStatus);
        Claim saved = claimRepository.save(claim);

        timelineRepository.save(new ClaimTimelineEvent(
                saved,
                newStatus,
                user,
                user.getFullName(),
                remarks != null ? remarks : "Status updated from " + oldStatus + " to " + newStatus
        ));

        // Notify customer
        if (saved.getCustomer() != null) {
            notificationRepository.save(new Notification(
                    saved.getCustomer(),
                    "Claim status updated",
                    saved.getClaimNumber() + " is now " + newStatus + ".",
                    "CLAIM",
                    "/customer/claims/" + saved.getId()
            ));
        }

        return enrichClaimDto(saved);
    }

    @Transactional
    public ClaimNoteDto addClaimNote(Long claimId, Long userId, Role role, ClaimNoteDto dto) {
        Claim claim = validateClaimAccess(claimId, userId, role);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClaimNote note = new ClaimNote(
                claim,
                user,
                user.getFullName(),
                dto.getNote(),
                dto.getIsInternal() != null ? dto.getIsInternal() : true
        );

        ClaimNote saved = noteRepository.save(note);
        return ClaimNoteDto.fromEntity(saved);
    }

    public List<ClaimNoteDto> getClaimNotes(Long claimId, Long userId, Role role) {
        validateClaimAccess(claimId, userId, role);
        if (role == Role.CUSTOMER) {
            return noteRepository.findByClaimIdAndIsInternalFalseOrderByCreatedAtDesc(claimId).stream()
                    .map(ClaimNoteDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return noteRepository.findByClaimIdOrderByCreatedAtDesc(claimId).stream()
                .map(ClaimNoteDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ClaimTimelineDto> getClaimTimeline(Long claimId, Long userId, Role role) {
        validateClaimAccess(claimId, userId, role);
        return timelineRepository.findByClaimIdOrderByEventTimeAsc(claimId).stream()
                .map(ClaimTimelineDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ClaimDto enrichClaimDto(Claim c) {
        ClaimDto dto = ClaimDto.fromEntity(c);
        dto.setDocumentsCount((int) documentRepository.countByClaimIdAndIsPhoto(c.getId(), false));
        dto.setPhotosCount((int) documentRepository.countByClaimIdAndIsPhoto(c.getId(), true));

        if (c.getCreatedAt() != null) {
            long days = ChronoUnit.DAYS.between(c.getCreatedAt().toLocalDate(), LocalDate.now());
            dto.setDaysInReview((int) Math.max(1, days));
        }

        assessmentRepository.findByClaimId(c.getId()).ifPresent(a -> {
            dto.setAssessed(true);
            dto.setAssessedAmount(a.getAssessedLoss());
            dto.setEligibleAmount(a.getEligibleAmount());
        });

        settlementRepository.findByClaimId(c.getId()).ifPresent(s -> {
            dto.setSettledAmount(s.getSettlementAmount());
            dto.setSettlementStatus(s.getStatus());
            dto.setSettlementReference(s.getSettlementReference());
        });

        return dto;
    }
}
