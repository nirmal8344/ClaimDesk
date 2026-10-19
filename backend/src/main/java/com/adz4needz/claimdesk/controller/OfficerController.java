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

import java.util.Map;

@RestController
@RequestMapping("/api/officer")
public class OfficerController {

    private final DashboardService dashboardService;
    private final ClaimService claimService;
    private final DocumentService documentService;
    private final AssessmentService assessmentService;

    public OfficerController(DashboardService dashboardService,
                             ClaimService claimService,
                             DocumentService documentService,
                             AssessmentService assessmentService) {
        this.dashboardService = dashboardService;
        this.claimService = claimService;
        this.documentService = documentService;
        this.assessmentService = assessmentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<OfficerDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getOfficerDashboard(currentUser.getId()));
    }

    @GetMapping("/claims")
    public ResponseEntity<Page<ClaimDto>> getAssignedClaims(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "claimType", required = false) String claimType,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(claimService.getOfficerClaims(currentUser.getId(), status, priority, claimType, search, pageRequest));
    }

    @PutMapping("/claims/{id}/status")
    public ResponseEntity<ClaimDto> updateClaimStatus(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String remarks = body.get("remarks");
        return ResponseEntity.ok(claimService.updateClaimStatus(claimId, currentUser.getId(), status, remarks));
    }

    @PostMapping("/claims/{id}/request-document")
    public ResponseEntity<RequestDocumentDto> requestAdditionalDocument(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody RequestDocumentDto dto) {
        return ResponseEntity.ok(documentService.requestAdditionalDocument(claimId, currentUser.getId(), dto));
    }

    @PutMapping("/documents/{id}/review")
    public ResponseEntity<ClaimDocumentDto> reviewDocument(
            @PathVariable("id") Long documentId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ReviewDocumentDto dto) {
        return ResponseEntity.ok(documentService.reviewDocument(documentId, currentUser.getId(), dto));
    }

    @PostMapping("/claims/{id}/assessment")
    public ResponseEntity<ClaimAssessmentDto> saveAssessment(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SaveAssessmentDto dto) {
        return ResponseEntity.ok(assessmentService.saveAssessment(claimId, currentUser.getId(), dto));
    }

    @GetMapping("/claims/{id}/assessment")
    public ResponseEntity<?> getAssessment(@PathVariable("id") Long claimId,
                                           @AuthenticationPrincipal UserPrincipal currentUser) {
        claimService.validateClaimAccess(claimId, currentUser.getId(), currentUser.getRole());
        return assessmentService.getAssessment(claimId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
