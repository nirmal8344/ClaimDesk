package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.dto.*;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    private final ClaimService claimService;
    private final DocumentService documentService;
    private final AssessmentService assessmentService;
    private final SettlementService settlementService;

    public ClaimController(ClaimService claimService,
                           DocumentService documentService,
                           AssessmentService assessmentService,
                           SettlementService settlementService) {
        this.claimService = claimService;
        this.documentService = documentService;
        this.assessmentService = assessmentService;
        this.settlementService = settlementService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClaimDto> getClaimById(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(claimService.getClaimById(claimId, currentUser.getId(), currentUser.getRole()));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<ClaimTimelineDto>> getTimeline(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(claimService.getClaimTimeline(claimId, currentUser.getId(), currentUser.getRole()));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<ClaimNoteDto>> getNotes(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(claimService.getClaimNotes(claimId, currentUser.getId(), currentUser.getRole()));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<ClaimNoteDto> addNote(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ClaimNoteDto dto) {
        return ResponseEntity.ok(claimService.addClaimNote(claimId, currentUser.getId(), currentUser.getRole(), dto));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<ClaimDocumentDto>> getDocuments(
            @PathVariable("id") Long claimId,
            @RequestParam(value = "isPhoto", required = false) Boolean isPhoto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        claimService.validateClaimAccess(claimId, currentUser.getId(), currentUser.getRole());
        return ResponseEntity.ok(documentService.getClaimDocuments(claimId, isPhoto));
    }

    @GetMapping("/{id}/document-requests")
    public ResponseEntity<List<RequestDocumentDto>> getDocumentRequests(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        claimService.validateClaimAccess(claimId, currentUser.getId(), currentUser.getRole());
        return ResponseEntity.ok(documentService.getDocumentRequests(claimId));
    }

    @GetMapping("/{id}/assessment")
    public ResponseEntity<?> getAssessment(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        claimService.validateClaimAccess(claimId, currentUser.getId(), currentUser.getRole());
        return assessmentService.getAssessment(claimId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}/settlement")
    public ResponseEntity<?> getSettlement(
            @PathVariable("id") Long claimId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        claimService.validateClaimAccess(claimId, currentUser.getId(), currentUser.getRole());
        return settlementService.getSettlementByClaimId(claimId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
