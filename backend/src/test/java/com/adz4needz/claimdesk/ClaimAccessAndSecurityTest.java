package com.adz4needz.claimdesk;

import com.adz4needz.claimdesk.dto.ClaimDto;
import com.adz4needz.claimdesk.entity.Claim;
import com.adz4needz.claimdesk.entity.Policy;
import com.adz4needz.claimdesk.entity.Role;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.UnauthorizedException;
import com.adz4needz.claimdesk.repository.*;
import com.adz4needz.claimdesk.service.ClaimService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimAccessAndSecurityTest {

    @Mock
    private ClaimRepository claimRepository;
    @Mock
    private PolicyRepository policyRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ClaimTimelineEventRepository timelineRepository;
    @Mock
    private ClaimNoteRepository noteRepository;
    @Mock
    private ClaimDocumentRepository documentRepository;
    @Mock
    private ClaimAssessmentRepository assessmentRepository;
    @Mock
    private SettlementRepository settlementRepository;
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private ClaimService claimService;

    private User customer1;
    private User customer2;
    private User officer1;
    private User officer2;
    private User admin;
    private Claim claim1;

    @BeforeEach
    void setUp() {
        customer1 = new User();
        customer1.setId(101L);
        customer1.setFullName("Customer One");
        customer1.setRole(Role.CUSTOMER);

        customer2 = new User();
        customer2.setId(102L);
        customer2.setFullName("Customer Two");
        customer2.setRole(Role.CUSTOMER);

        officer1 = new User();
        officer1.setId(201L);
        officer1.setFullName("Officer One");
        officer1.setRole(Role.CLAIM_OFFICER);

        officer2 = new User();
        officer2.setId(202L);
        officer2.setFullName("Officer Two");
        officer2.setRole(Role.CLAIM_OFFICER);

        admin = new User();
        admin.setId(1L);
        admin.setFullName("Admin User");
        admin.setRole(Role.ADMIN);

        Policy policy = new Policy();
        policy.setId(501L);
        policy.setCustomer(customer1);
        policy.setPolicyNumber("POL-1001");
        policy.setPolicyType("Motor Insurance");
        policy.setCoverageAmount(new BigDecimal("500000.00"));

        claim1 = new Claim();
        claim1.setId(1001L);
        claim1.setClaimNumber("CLM-1001");
        claim1.setCustomer(customer1);
        claim1.setPolicy(policy);
        claim1.setAssignedOfficer(officer1);
        claim1.setStatus("Under Review");
        claim1.setRequestedAmount(new BigDecimal("25000.00"));
    }

    @Test
    void customer_canAccessOwnClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));

        ClaimDto result = claimService.getClaimById(1001L, customer1.getId(), Role.CUSTOMER);
        assertNotNull(result);
        assertEquals("CLM-1001", result.getClaimNumber());
    }

    @Test
    void customer_cannotAccessAnotherCustomersClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));

        assertThrows(UnauthorizedException.class, () -> {
            claimService.getClaimById(1001L, customer2.getId(), Role.CUSTOMER);
        });
    }

    @Test
    void officer_canAccessAssignedClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));

        ClaimDto result = claimService.getClaimById(1001L, officer1.getId(), Role.CLAIM_OFFICER);
        assertNotNull(result);
        assertEquals("CLM-1001", result.getClaimNumber());
    }

    @Test
    void officer_cannotAccessUnassignedClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));

        assertThrows(UnauthorizedException.class, () -> {
            claimService.getClaimById(1001L, officer2.getId(), Role.CLAIM_OFFICER);
        });
    }

    @Test
    void admin_canAccessAnyClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));

        ClaimDto result = claimService.getClaimById(1001L, admin.getId(), Role.ADMIN);
        assertNotNull(result);
        assertEquals("CLM-1001", result.getClaimNumber());
    }

    @Test
    void officer_cannotDirectlyApproveClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(officer1.getId())).thenReturn(Optional.of(officer1));

        assertThrows(BadRequestException.class, () -> {
            claimService.updateClaimStatus(1001L, officer1.getId(), "Approved", "Attempting approval");
        });
    }

    @Test
    void officer_cannotDirectlySettleClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(officer1.getId())).thenReturn(Optional.of(officer1));

        assertThrows(BadRequestException.class, () -> {
            claimService.updateClaimStatus(1001L, officer1.getId(), "Settled", "Attempting settlement");
        });
    }

    @Test
    void unassignedOfficer_cannotUpdateClaimStatus() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(officer2.getId())).thenReturn(Optional.of(officer2));

        assertThrows(UnauthorizedException.class, () -> {
            claimService.updateClaimStatus(1001L, officer2.getId(), "Assessment", "Unassigned attempt");
        });
    }
}
