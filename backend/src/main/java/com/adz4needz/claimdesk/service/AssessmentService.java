package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.ClaimAssessmentDto;
import com.adz4needz.claimdesk.dto.SaveAssessmentDto;
import com.adz4needz.claimdesk.entity.Claim;
import com.adz4needz.claimdesk.entity.ClaimAssessment;
import com.adz4needz.claimdesk.entity.ClaimTimelineEvent;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.ClaimAssessmentRepository;
import com.adz4needz.claimdesk.repository.ClaimRepository;
import com.adz4needz.claimdesk.repository.ClaimTimelineEventRepository;
import com.adz4needz.claimdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AssessmentService {

    private final ClaimAssessmentRepository assessmentRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ClaimTimelineEventRepository timelineRepository;

    public AssessmentService(ClaimAssessmentRepository assessmentRepository,
                             ClaimRepository claimRepository,
                             UserRepository userRepository,
                             ClaimTimelineEventRepository timelineRepository) {
        this.assessmentRepository = assessmentRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.timelineRepository = timelineRepository;
    }

    public Optional<ClaimAssessmentDto> getAssessment(Long claimId) {
        return assessmentRepository.findByClaimId(claimId)
                .map(ClaimAssessmentDto::fromEntity);
    }

    @Transactional
    public ClaimAssessmentDto saveAssessment(Long claimId, Long officerId, SaveAssessmentDto dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.getRole() == com.adz4needz.claimdesk.entity.Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(officerId)) {
                throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only assess claims assigned to you");
            }
        }

        if ("Draft".equalsIgnoreCase(claim.getStatus()) || "Closed".equalsIgnoreCase(claim.getStatus())) {
            throw new BadRequestException("Cannot assess claim in status: " + claim.getStatus());
        }

        ClaimAssessment assessment = assessmentRepository.findByClaimId(claimId)
                .orElse(new ClaimAssessment());

        assessment.setClaim(claim);
        assessment.setOfficer(officer);
        assessment.setAssessmentDate(dto.getAssessmentDate());
        assessment.setAssessedLoss(dto.getAssessedLoss());
        assessment.setEligibleAmount(dto.getEligibleAmount());
        assessment.setNonEligibleAmount(dto.getNonEligibleAmount());
        assessment.setRemarks(dto.getRemarks());
        assessment.setRecommendation(dto.getRecommendation());

        ClaimAssessment saved = assessmentRepository.save(assessment);

        // Update claim status to Assessment
        claim.setStatus("Assessment");
        claimRepository.save(claim);

        timelineRepository.save(new ClaimTimelineEvent(
                claim,
                "Assessment Completed",
                officer,
                officer.getFullName(),
                "Assessed Loss: ₹" + dto.getAssessedLoss() + ", Eligible: ₹" + dto.getEligibleAmount() + ". Recommendation: " + dto.getRecommendation()
        ));

        return ClaimAssessmentDto.fromEntity(saved);
    }
}
