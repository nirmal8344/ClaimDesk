package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.dto.*;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final DashboardService dashboardService;
    private final PolicyService policyService;
    private final ClaimService claimService;
    private final SystemSettingService settingService;

    public CustomerController(DashboardService dashboardService,
                              PolicyService policyService,
                              ClaimService claimService,
                              SystemSettingService settingService) {
        this.dashboardService = dashboardService;
        this.policyService = policyService;
        this.claimService = claimService;
        this.settingService = settingService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<CustomerDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getCustomerDashboard(currentUser.getId()));
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getPolicies(@AuthenticationPrincipal UserPrincipal currentUser,
                                                       @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(policyService.getPoliciesForCustomerAndStatus(currentUser.getId(), status));
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable("id") Long policyId,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(policyService.getCustomerPolicyById(policyId, currentUser.getId()));
    }

    @PostMapping("/policies")
    public ResponseEntity<PolicyDto> addPolicy(@AuthenticationPrincipal UserPrincipal currentUser,
                                               @Valid @RequestBody CreatePolicyDto dto) {
        return ResponseEntity.ok(policyService.createPolicyForCustomer(currentUser.getId(), dto));
    }

    @GetMapping("/claims")
    public ResponseEntity<Page<ClaimDto>> getClaims(@AuthenticationPrincipal UserPrincipal currentUser,
                                                    @RequestParam(value = "status", required = false) String status,
                                                    @RequestParam(value = "search", required = false) String search,
                                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                                    @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(claimService.getCustomerClaims(currentUser.getId(), status, search, pageRequest));
    }

    @PostMapping("/claims")
    public ResponseEntity<ClaimDto> createClaim(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @Valid @RequestBody CreateClaimDto dto) {
        return ResponseEntity.ok(claimService.createClaim(currentUser.getId(), dto));
    }

    @PutMapping("/claims/{id}/submit")
    public ResponseEntity<ClaimDto> submitDraftClaim(@PathVariable("id") Long claimId,
                                                     @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(claimService.submitDraftClaim(claimId, currentUser.getId()));
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<CustomerFeedbackDto>> getFeedback(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(settingService.getFeedbackForCustomer(currentUser.getId()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<CustomerFeedbackDto> submitFeedback(@AuthenticationPrincipal UserPrincipal currentUser,
                                                              @Valid @RequestBody CustomerFeedbackDto dto) {
        return ResponseEntity.ok(settingService.submitFeedback(currentUser.getId(), dto));
    }
}
