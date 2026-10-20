package com.adz4needz.claimdesk;

import com.adz4needz.claimdesk.dto.CreatePolicyDto;
import com.adz4needz.claimdesk.dto.PolicyDto;
import com.adz4needz.claimdesk.entity.Policy;
import com.adz4needz.claimdesk.entity.Role;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.repository.PolicyRepository;
import com.adz4needz.claimdesk.repository.UserRepository;
import com.adz4needz.claimdesk.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicySecurityAndAuthorizationTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PolicyService policyService;

    private User customer1;
    private User customer2;
    private User admin;
    private Policy policy1;

    @BeforeEach
    void setUp() {
        customer1 = new User();
        customer1.setId(101L);
        customer1.setFullName("Arun Kumar");
        customer1.setEmail("arun@example.com");
        customer1.setRole(Role.CUSTOMER);

        customer2 = new User();
        customer2.setId(102L);
        customer2.setFullName("Priya Sharma");
        customer2.setEmail("priya@example.com");
        customer2.setRole(Role.CUSTOMER);

        admin = new User();
        admin.setId(1L);
        admin.setFullName("Admin User");
        admin.setRole(Role.ADMIN);

        policy1 = new Policy();
        policy1.setId(501L);
        policy1.setCustomer(customer1);
        policy1.setPolicyNumber("POL-1001");
        policy1.setPolicyType("Motor Comprehensive");
        policy1.setProviderCompany("Aegis Insurance");
        policy1.setStartDate(LocalDate.of(2025, 1, 1));
        policy1.setEndDate(LocalDate.of(2026, 1, 1));
        policy1.setCoverageAmount(new BigDecimal("500000.00"));
        policy1.setPremiumAmount(new BigDecimal("15000.00"));
        policy1.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Authenticated customer can successfully create a policy for their own account")
    void customer_canCreateOwnPolicy() {
        CreatePolicyDto dto = new CreatePolicyDto();
        dto.setPolicyNumber("POL-9999");
        dto.setPolicyType("Health Individual");
        dto.setProviderCompany("Star Health");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2026, 1, 1));
        dto.setCoverageAmount(new BigDecimal("300000.00"));
        dto.setPremiumAmount(new BigDecimal("10000.00"));

        when(userRepository.findById(101L)).thenReturn(Optional.of(customer1));
        when(policyRepository.existsByPolicyNumber("POL-9999")).thenReturn(false);
        when(policyRepository.save(any(Policy.class))).thenAnswer(invocation -> {
            Policy saved = invocation.getArgument(0);
            saved.setId(502L);
            return saved;
        });

        PolicyDto result = policyService.createPolicyForCustomer(customer1.getId(), dto);

        assertNotNull(result);
        assertEquals("POL-9999", result.getPolicyNumber());
        assertEquals("Health Individual", result.getPolicyType());
        assertEquals(customer1.getId(), result.getCustomerId());
        assertEquals(customer1.getFullName(), result.getCustomerName());
    }

    @Test
    @DisplayName("Customer cannot create policy for another customer even if customerId is tampered in request")
    void customer_cannotCreatePolicyForAnotherCustomerByTamperingCustomerId() {
        CreatePolicyDto dto = new CreatePolicyDto();
        dto.setCustomerId(customer2.getId()); // Tampering: Customer 1 sends Customer 2's ID
        dto.setPolicyNumber("POL-TAMPER-1");
        dto.setPolicyType("Property Home");
        dto.setProviderCompany("HDFC ERGO");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2026, 1, 1));
        dto.setCoverageAmount(new BigDecimal("1000000.00"));
        dto.setPremiumAmount(new BigDecimal("12000.00"));

        when(userRepository.findById(101L)).thenReturn(Optional.of(customer1));
        when(policyRepository.existsByPolicyNumber("POL-TAMPER-1")).thenReturn(false);
        when(policyRepository.save(any(Policy.class))).thenAnswer(invocation -> {
            Policy saved = invocation.getArgument(0);
            saved.setId(503L);
            return saved;
        });

        // Calling createPolicyForCustomer with authenticated user ID (101L)
        PolicyDto result = policyService.createPolicyForCustomer(customer1.getId(), dto);

        assertNotNull(result);
        // Target customer MUST be customer1 (101L), NOT customer2 (102L)
        assertEquals(customer1.getId(), result.getCustomerId());
        ArgumentCaptor<Policy> policyCaptor = ArgumentCaptor.forClass(Policy.class);
        verify(policyRepository).save(policyCaptor.capture());
        assertEquals(customer1.getId(), policyCaptor.getValue().getCustomer().getId());
    }

    @Test
    @DisplayName("Auto-generates unique policy number if policyNumber is omitted or empty")
    void customer_autoGeneratesPolicyNumberWhenOmitted() {
        CreatePolicyDto dto = new CreatePolicyDto();
        dto.setPolicyNumber(null); // Omitted
        dto.setPolicyType("Motor Comprehensive");
        dto.setProviderCompany("Bajaj Allianz");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2026, 1, 1));
        dto.setCoverageAmount(new BigDecimal("400000.00"));
        dto.setPremiumAmount(new BigDecimal("8000.00"));

        when(userRepository.findById(101L)).thenReturn(Optional.of(customer1));
        when(policyRepository.count()).thenReturn(5L);
        when(policyRepository.existsByPolicyNumber(anyString())).thenReturn(false);
        when(policyRepository.save(any(Policy.class))).thenAnswer(invocation -> {
            Policy saved = invocation.getArgument(0);
            saved.setId(504L);
            return saved;
        });

        PolicyDto result = policyService.createPolicyForCustomer(customer1.getId(), dto);

        assertNotNull(result);
        assertNotNull(result.getPolicyNumber());
        assertTrue(result.getPolicyNumber().startsWith("POL-"));
    }

    @Test
    @DisplayName("Rejects policy creation if end date is before start date")
    void customer_rejectsEndDateBeforeStartDate() {
        CreatePolicyDto dto = new CreatePolicyDto();
        dto.setPolicyNumber("POL-INVALID-DATE");
        dto.setPolicyType("Health Individual");
        dto.setProviderCompany("Star Health");
        dto.setStartDate(LocalDate.of(2025, 6, 1));
        dto.setEndDate(LocalDate.of(2025, 1, 1)); // End before start
        dto.setCoverageAmount(new BigDecimal("300000.00"));
        dto.setPremiumAmount(new BigDecimal("10000.00"));

        when(userRepository.findById(101L)).thenReturn(Optional.of(customer1));
        when(policyRepository.existsByPolicyNumber("POL-INVALID-DATE")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            policyService.createPolicyForCustomer(customer1.getId(), dto);
        });
        assertTrue(ex.getMessage().contains("cannot be earlier than start date"));
    }

    @Test
    @DisplayName("Rejects policy creation if policy number already exists")
    void customer_rejectsDuplicatePolicyNumber() {
        CreatePolicyDto dto = new CreatePolicyDto();
        dto.setPolicyNumber("POL-1001"); // Already exists
        dto.setPolicyType("Health Individual");
        dto.setProviderCompany("Star Health");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setEndDate(LocalDate.of(2026, 1, 1));
        dto.setCoverageAmount(new BigDecimal("300000.00"));
        dto.setPremiumAmount(new BigDecimal("10000.00"));

        when(userRepository.findById(101L)).thenReturn(Optional.of(customer1));
        when(policyRepository.existsByPolicyNumber("POL-1001")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            policyService.createPolicyForCustomer(customer1.getId(), dto);
        });
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Customer can view their own policy by ID")
    void customer_canViewOwnPolicyById() {
        when(policyRepository.findById(501L)).thenReturn(Optional.of(policy1));

        PolicyDto result = policyService.getCustomerPolicyById(501L, customer1.getId());

        assertNotNull(result);
        assertEquals("POL-1001", result.getPolicyNumber());
        assertEquals("Motor Comprehensive", result.getPolicyType());
        assertEquals("Aegis Insurance", result.getProviderCompany());
        assertEquals(new BigDecimal("500000.00"), result.getCoverageAmount());
        assertEquals(new BigDecimal("15000.00"), result.getPremiumAmount());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    @DisplayName("Customer cannot view another customer's policy by ID (AccessDeniedException)")
    void customer_cannotViewAnotherCustomersPolicyById() {
        when(policyRepository.findById(501L)).thenReturn(Optional.of(policy1));

        assertThrows(AccessDeniedException.class, () -> {
            policyService.getCustomerPolicyById(501L, customer2.getId()); // Customer 2 tries to access Customer 1's policy
        });
    }

    @Test
    @DisplayName("Admin can view any policy by ID")
    void admin_canViewAnyPolicyById() {
        when(policyRepository.findById(501L)).thenReturn(Optional.of(policy1));

        PolicyDto result = policyService.getPolicyById(501L);

        assertNotNull(result);
        assertEquals("POL-1001", result.getPolicyNumber());
        assertEquals(customer1.getId(), result.getCustomerId());
    }
}
