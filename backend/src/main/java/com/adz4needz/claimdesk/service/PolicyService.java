package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.CreatePolicyDto;
import com.adz4needz.claimdesk.dto.PolicyDto;
import com.adz4needz.claimdesk.entity.Policy;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.PolicyRepository;
import com.adz4needz.claimdesk.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    public PolicyService(PolicyRepository policyRepository, UserRepository userRepository) {
        this.policyRepository = policyRepository;
        this.userRepository = userRepository;
    }

    public synchronized String generateUniquePolicyNumber() {
        long count = policyRepository.count() + 1000;
        String policyNum = "POL-" + count;
        while (policyRepository.existsByPolicyNumber(policyNum)) {
            count++;
            policyNum = "POL-" + count;
        }
        return policyNum;
    }

    public List<PolicyDto> getPoliciesForCustomer(Long customerId) {
        return policyRepository.findByCustomerId(customerId).stream()
                .map(PolicyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getPoliciesForCustomerAndStatus(Long customerId, String status) {
        if ("ALL".equalsIgnoreCase(status) || status == null || status.isBlank()) {
            return getPoliciesForCustomer(customerId);
        }
        return policyRepository.findByCustomerIdAndStatus(customerId, status.toUpperCase()).stream()
                .map(PolicyDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PolicyDto getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        return PolicyDto.fromEntity(policy);
    }

    public PolicyDto getCustomerPolicyById(Long policyId, Long customerId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + policyId));
        if (policy.getCustomer() == null || !policy.getCustomer().getId().equals(customerId)) {
            throw new AccessDeniedException("Access Denied: You do not have permission to view another customer's policy");
        }
        return PolicyDto.fromEntity(policy);
    }

    @Transactional
    public PolicyDto createPolicyForCustomer(Long customerId, CreatePolicyDto dto) {
        // Enforce role-based authorization: customerId strictly bound to the authenticated user
        dto.setCustomerId(customerId);
        return createPolicyInternal(customerId, dto);
    }

    @Transactional
    public PolicyDto createPolicy(Long currentUserId, CreatePolicyDto dto) {
        Long targetCustomerId = (dto.getCustomerId() != null) ? dto.getCustomerId() : currentUserId;
        return createPolicyInternal(targetCustomerId, dto);
    }

    private PolicyDto createPolicyInternal(Long targetCustomerId, CreatePolicyDto dto) {
        User customer = userRepository.findById(targetCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + targetCustomerId));

        String policyNumber = dto.getPolicyNumber();
        if (policyNumber == null || policyNumber.trim().isEmpty()) {
            policyNumber = generateUniquePolicyNumber();
        } else {
            policyNumber = policyNumber.trim().toUpperCase();
            if (policyRepository.existsByPolicyNumber(policyNumber)) {
                throw new BadRequestException("Policy number already exists");
            }
        }

        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new BadRequestException("Policy start date and end date are required");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("Policy end date cannot be earlier than start date");
        }

        if (dto.getCoverageAmount() == null || dto.getCoverageAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Coverage amount must be greater than zero");
        }

        if (dto.getPremiumAmount() == null || dto.getPremiumAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Premium amount must be positive or zero");
        }

        if (dto.getPolicyType() == null || dto.getPolicyType().trim().isEmpty()) {
            throw new BadRequestException("Policy type is required");
        }

        if (dto.getProviderCompany() == null || dto.getProviderCompany().trim().isEmpty()) {
            throw new BadRequestException("Provider company is required");
        }

        Policy policy = new Policy();
        policy.setCustomer(customer);
        policy.setPolicyNumber(policyNumber);
        policy.setPolicyType(dto.getPolicyType().trim());
        policy.setProviderCompany(dto.getProviderCompany().trim());
        policy.setStartDate(dto.getStartDate());
        policy.setEndDate(dto.getEndDate());
        policy.setCoverageAmount(dto.getCoverageAmount());
        policy.setPremiumAmount(dto.getPremiumAmount());
        policy.setPremiumTerm(dto.getPremiumTerm() != null && !dto.getPremiumTerm().isBlank() ? dto.getPremiumTerm().trim() : "year");
        policy.setCoverageDescription(dto.getCoverageDescription());

        String initialStatus = (dto.getStatus() != null && !dto.getStatus().isBlank()) ? dto.getStatus().trim().toUpperCase() : "ACTIVE";
        if (dto.getEndDate().isBefore(LocalDate.now())) {
            initialStatus = "EXPIRED";
        }
        policy.setStatus(initialStatus);

        Policy saved = policyRepository.save(policy);
        return PolicyDto.fromEntity(saved);
    }

    public Page<PolicyDto> getAllPolicies(String status, String search, Pageable pageable) {
        Page<Policy> page;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            page = policyRepository.searchPoliciesByStatus(status.toUpperCase(), search != null ? search : "", pageable);
        } else if (search != null && !search.isBlank()) {
            page = policyRepository.searchPolicies(search, pageable);
        } else {
            page = policyRepository.findAll(pageable);
        }
        return page.map(PolicyDto::fromEntity);
    }

    @Transactional
    public PolicyDto updatePolicyStatus(Long policyId, String status) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + policyId));
        policy.setStatus(status.toUpperCase());
        Policy saved = policyRepository.save(policy);
        return PolicyDto.fromEntity(saved);
    }
}
