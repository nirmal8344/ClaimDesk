package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.dto.*;
import com.adz4needz.claimdesk.entity.User;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DashboardService dashboardService;
    private final ClaimService claimService;
    private final DecisionService decisionService;
    private final SettlementService settlementService;
    private final PolicyService policyService;
    private final AuthService authService;

    public AdminController(DashboardService dashboardService,
                           ClaimService claimService,
                           DecisionService decisionService,
                           SettlementService settlementService,
                           PolicyService policyService,
                           AuthService authService) {
        this.dashboardService = dashboardService;
        this.claimService = claimService;
        this.decisionService = decisionService;
        this.settlementService = settlementService;
        this.policyService = policyService;
        this.authService = authService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/claims")
    public ResponseEntity<Page<ClaimDto>> getAllClaims(
            @RequestParam(value = "customerId", required = false) Long customerId,
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "claimType", required = false) String claimType,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(claimService.getAllClaimsAdmin(customerId, officerId, status, priority, claimType, startDate, endDate, search, pageRequest));
    }

    @PutMapping("/claims/{id}/assign")
    public ResponseEntity<ClaimDto> assignClaim(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AssignClaimDto dto) {
        return ResponseEntity.ok(claimService.assignClaim(claimId, currentUser.getId(), dto));
    }

    @PostMapping("/claims/{id}/decision")
    public ResponseEntity<ClaimDto> recordDecision(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ClaimDecisionDto dto) {
        return ResponseEntity.ok(decisionService.recordDecision(claimId, currentUser.getId(), dto));
    }

    @PostMapping("/claims/{id}/settlement")
    public ResponseEntity<SettlementDto> recordSettlement(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SaveSettlementDto dto) {
        return ResponseEntity.ok(settlementService.recordSettlement(claimId, currentUser.getId(), dto));
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<User>> getCustomers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(authService.getCustomers(search, pageRequest));
    }

    @PutMapping("/customers/{id}/status")
    public ResponseEntity<User> updateCustomerStatus(
            @PathVariable("id") Long customerId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(authService.updateUserStatus(customerId, status));
    }

    @GetMapping("/officers")
    public ResponseEntity<Page<User>> getOfficers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(authService.getOfficers(search, pageRequest));
    }

    @PostMapping("/officers")
    public ResponseEntity<User> createOfficer(@Valid @RequestBody CreateOfficerRequest request) {
        return ResponseEntity.ok(authService.createOfficer(request));
    }

    @PutMapping("/officers/{id}/status")
    public ResponseEntity<User> updateOfficerStatus(
            @PathVariable("id") Long officerId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(authService.updateUserStatus(officerId, status));
    }

    @GetMapping("/policies")
    public ResponseEntity<Page<PolicyDto>> getPolicies(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(policyService.getAllPolicies(status, search, pageRequest));
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable("id") Long policyId) {
        return ResponseEntity.ok(policyService.getPolicyById(policyId));
    }

    @PostMapping("/policies")
    public ResponseEntity<PolicyDto> createPolicy(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreatePolicyDto dto) {
        return ResponseEntity.ok(policyService.createPolicy(currentUser.getId(), dto));
    }

    @PutMapping("/policies/{id}/status")
    public ResponseEntity<PolicyDto> updatePolicyStatus(
            @PathVariable("id") Long policyId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(policyService.updatePolicyStatus(policyId, status));
    }
}
