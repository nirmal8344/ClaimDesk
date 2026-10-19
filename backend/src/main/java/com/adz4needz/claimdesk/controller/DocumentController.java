package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.dto.ClaimDocumentDto;
import com.adz4needz.claimdesk.entity.ClaimDocument;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ClaimDocumentDto> uploadDocument(
            @RequestParam("claimId") Long claimId,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "isPhoto", defaultValue = "false") Boolean isPhoto,
            @RequestParam(value = "photoCategory", required = false) String photoCategory,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.uploadClaimFile(
                claimId, currentUser.getId(), documentType, isPhoto, photoCategory, description, file
        ));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable("id") Long documentId,
                                                      @AuthenticationPrincipal UserPrincipal currentUser) {
        ClaimDocument doc = documentService.getDocumentEntityWithAccessCheck(documentId, currentUser);
        Resource resource = documentService.loadFileAsResource(documentId);

        String contentType = doc.getFileType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/view")
    public ResponseEntity<Resource> viewDocument(@PathVariable("id") Long documentId,
                                                  @AuthenticationPrincipal UserPrincipal currentUser) {
        ClaimDocument doc = documentService.getDocumentEntityWithAccessCheck(documentId, currentUser);
        Resource resource = documentService.loadFileAsResource(documentId);

        String contentType = doc.getFileType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable("id") Long documentId,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        documentService.deleteDocument(documentId, currentUser.getId());
        return ResponseEntity.ok().body("Document deleted successfully");
    }
}
