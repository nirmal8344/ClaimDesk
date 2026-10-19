package com.adz4needz.claimdesk;

import com.adz4needz.claimdesk.dto.ClaimDto;
import com.adz4needz.claimdesk.dto.CreateClaimDto;
import com.adz4needz.claimdesk.dto.SaveSettlementDto;
import com.adz4needz.claimdesk.dto.SettlementDto;
import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.UnauthorizedException;
import com.adz4needz.claimdesk.repository.*;
import com.adz4needz.claimdesk.service.ClaimService;
import com.adz4needz.claimdesk.service.SettlementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimLifecycleAndSettlementTest {

    @Mock
    private SettlementRepository settlementRepository;
    @Mock
    private ClaimRepository claimRepository;
    @Mock
    private ClaimDecisionRepository decisionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ClaimTimelineEventRepository timelineRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private PolicyRepository policyRepository;
    @Mock
    private ClaimDocumentRepository documentRepository;
    @Mock
    private ClaimAssessmentRepository assessmentRepository;

    @InjectMocks
    private SettlementService settlementService;

    @InjectMocks
    private ClaimService claimService;

    private User admin;
    private User customer;
    private Policy policy;
    private Claim claim;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setFullName("Admin User");
        admin.setRole(Role.ADMIN);

        customer = new User();
        customer.setId(101L);
        customer.setFullName("Customer One");
        customer.setRole(Role.CUSTOMER);

        policy = new Policy();
        policy.setId(501L);
        policy.setCustomer(customer);
        policy.setPolicyNumber("POL-1001");
        policy.setStatus("ACTIVE");
        policy.setCoverageAmount(new BigDecimal("500000.00"));

        claim = new Claim();
        claim.setId(1001L);
        claim.setClaimNumber("CLM-1001");
        claim.setCustomer(customer);
        claim.setPolicy(policy);
        claim.setStatus("Under Review");
        claim.setRequestedAmount(new BigDecimal("45000.00"));
    }

    @Test
    void settlement_cannotBeProcessedForUnapprovedClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));

        SaveSettlementDto dto = new SaveSettlementDto();
        dto.setSettlementAmount(new BigDecimal("45000.00"));
        dto.setSettlementDate(LocalDate.now());

        assertThrows(BadRequestException.class, () -> {
            settlementService.recordSettlement(1001L, admin.getId(), dto);
        });
    }

    @Test
    void settlement_successfulWhenClaimIsApproved() {
        claim.setStatus("Approved");

        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim));
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(settlementRepository.findByClaimId(1001L)).thenReturn(Optional.empty());
        when(settlementRepository.save(any(Settlement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaveSettlementDto dto = new SaveSettlementDto();
        dto.setSettlementAmount(new BigDecimal("40000.00"));
        dto.setSettlementDate(LocalDate.now());
        dto.setStatus("Completed");

        SettlementDto result = settlementService.recordSettlement(1001L, admin.getId(), dto);

        assertNotNull(result);
        assertEquals(new BigDecimal("40000.00"), result.getSettlementAmount());
        assertEquals("Settled", claim.getStatus());
        verify(claimRepository).save(claim);
        verify(timelineRepository).save(any(ClaimTimelineEvent.class));
    }

    @Test
    void draftClaim_submissionSucceeds() {
        claim.setStatus("Draft");

        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any(Claim.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClaimDto result = claimService.submitDraftClaim(1001L, customer.getId());

        assertNotNull(result);
        assertEquals("Submitted", claim.getStatus());
        verify(timelineRepository).save(any(ClaimTimelineEvent.class));
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void submittedClaim_cannotBeResubmittedAsDraft() {
        claim.setStatus("Submitted");

        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim));

        assertThrows(BadRequestException.class, () -> {
            claimService.submitDraftClaim(1001L, customer.getId());
        });
    }

    @Test
    void draftClaim_cannotBeSubmittedByAnotherUser() {
        claim.setStatus("Draft");

        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim));

        assertThrows(UnauthorizedException.class, () -> {
            claimService.submitDraftClaim(1001L, 999L);
        });
    }
}
