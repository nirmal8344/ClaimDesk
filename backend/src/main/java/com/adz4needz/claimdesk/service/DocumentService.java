package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.dto.ClaimDocumentDto;
import com.adz4needz.claimdesk.dto.RequestDocumentDto;
import com.adz4needz.claimdesk.dto.ReviewDocumentDto;
import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.ResourceNotFoundException;
import com.adz4needz.claimdesk.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final Path fileStorageLocation;
    private final ClaimDocumentRepository documentRepository;
    private final DocumentRequestRepository requestRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final ClaimTimelineEventRepository timelineRepository;
    private final NotificationRepository notificationRepository;

    public DocumentService(
            @Value("${file.upload-dir:uploads}") String uploadDir,
            ClaimDocumentRepository documentRepository,
            DocumentRequestRepository requestRepository,
            ClaimRepository claimRepository,
            UserRepository userRepository,
            ClaimTimelineEventRepository timelineRepository,
            NotificationRepository notificationRepository) {
        this.documentRepository = documentRepository;
        this.requestRepository = requestRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.timelineRepository = timelineRepository;
        this.notificationRepository = notificationRepository;

        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    @Transactional
    public ClaimDocumentDto uploadClaimFile(Long claimId, Long userId, String documentType,
                                           Boolean isPhoto, String photoCategory, String description,
                                           MultipartFile file) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() == Role.CUSTOMER) {
            if (claim.getCustomer() == null || !claim.getCustomer().getId().equals(userId)) {
                throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only upload documents to your own claims");
            }
        } else if (user.getRole() == Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(userId)) {
                throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only upload documents to claims assigned to you");
            }
        }

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (originalFileName.contains("..") || originalFileName.contains("/") || originalFileName.contains("\\")) {
            throw new BadRequestException("Invalid filename containing path traversal characters");
        }

        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf(".");
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex).toLowerCase();
        }

        List<String> allowedExtensions = Arrays.asList(".pdf", ".jpg", ".jpeg", ".png");
        if (!allowedExtensions.contains(fileExtension)) {
            throw new BadRequestException("Only PDF, JPG, and PNG files are allowed");
        }

        String contentType = file.getContentType();
        List<String> allowedMimes = Arrays.asList("application/pdf", "image/jpeg", "image/png", "image/pjpeg");
        if (contentType != null && !allowedMimes.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file format. Allowed formats: PDF, JPG, PNG");
        }

        // Limit to 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB limit");
        }

        try {
            String claimDir = "claim_" + claim.getClaimNumber();
            Path targetDir = this.fileStorageLocation.resolve(claimDir);
            Files.createDirectories(targetDir);

            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetLocation = targetDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            ClaimDocument doc = new ClaimDocument();
            doc.setClaim(claim);
            doc.setDocumentType(documentType != null ? documentType : (Boolean.TRUE.equals(isPhoto) ? "Damage Photograph" : "Other"));
            doc.setFileName(originalFileName);
            doc.setStoredPath(claimDir + "/" + uniqueFileName);
            doc.setFileSize(file.getSize());
            doc.setFileType(file.getContentType());
            doc.setIsPhoto(Boolean.TRUE.equals(isPhoto));
            doc.setPhotoCategory(photoCategory);
            doc.setDescription(description);
            doc.setUploadedBy(user);
            doc.setUploadDate(LocalDateTime.now());
            doc.setReviewStatus("Pending Review");

            ClaimDocument savedDoc = documentRepository.save(doc);

            // Record timeline event
            String eventDesc = (Boolean.TRUE.equals(isPhoto) ? "Photograph" : "Document") + " uploaded: " + originalFileName;
            timelineRepository.save(new ClaimTimelineEvent(claim, "Documents Uploaded", user, user.getFullName(), eventDesc));

            // Check if there was an open document request for this document type
            List<DocumentRequest> pendingReqs = requestRepository.findByClaimIdAndStatus(claimId, "PENDING");
            for (DocumentRequest req : pendingReqs) {
                if (req.getDocumentType().equalsIgnoreCase(doc.getDocumentType())) {
                    req.setStatus("FULFILLED");
                    req.setFulfilledAt(LocalDateTime.now());
                    requestRepository.save(req);
                }
            }

            // Notify assigned officer if officer is assigned
            if (claim.getAssignedOfficer() != null) {
                notificationRepository.save(new Notification(
                        claim.getAssignedOfficer(),
                        "Customer uploaded a new document",
                        claim.getClaimNumber() + " - " + originalFileName,
                        "DOCUMENT",
                        "/officer/claims/" + claim.getId()
                ));
            }

            return ClaimDocumentDto.fromEntity(savedDoc);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName, ex);
        }
    }

    public Resource loadFileAsResource(Long documentId) {
        ClaimDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        try {
            Path filePath = this.fileStorageLocation.resolve(doc.getStoredPath()).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new BadRequestException("Invalid storage path");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on server");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path is invalid: " + ex.getMessage());
        }
    }

    public ClaimDocument getDocumentEntity(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
    }

    /**
     * Validates that the requesting user has permission to access this document
     * based on their role and relationship to the claim.
     */
    public ClaimDocument getDocumentEntityWithAccessCheck(Long documentId, com.adz4needz.claimdesk.security.UserPrincipal currentUser) {
        ClaimDocument doc = getDocumentEntity(documentId);
        validateDocumentAccess(doc, currentUser, false);
        return doc;
    }

    private void validateDocumentAccess(ClaimDocument doc, com.adz4needz.claimdesk.security.UserPrincipal user, boolean isModify) {
        if (user == null) {
            throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Authentication required to access documents");
        }
        com.adz4needz.claimdesk.entity.Role role = user.getRole();
        Long userId = user.getId();
        Claim claim = doc.getClaim();

        if (role == com.adz4needz.claimdesk.entity.Role.ADMIN) {
            return; // Admins can access all documents
        }
        if (role == com.adz4needz.claimdesk.entity.Role.CLAIM_OFFICER) {
            // Officers can access documents for claims assigned to them
            if (claim.getAssignedOfficer() != null && claim.getAssignedOfficer().getId().equals(userId)) {
                return;
            }
            throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only access documents for claims assigned to you");
        }
        if (role == com.adz4needz.claimdesk.entity.Role.CUSTOMER) {
            // Customers can only access documents on their own claims
            if (claim.getCustomer() != null && claim.getCustomer().getId().equals(userId)) {
                return;
            }
            throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only access documents on your own claims");
        }
        throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied");
    }

    public List<ClaimDocumentDto> getClaimDocuments(Long claimId, Boolean isPhoto) {
        if (isPhoto != null) {
            return documentRepository.findByClaimIdAndIsPhoto(claimId, isPhoto).stream()
                    .map(ClaimDocumentDto::fromEntity)
                    .collect(Collectors.toList());
        }
        return documentRepository.findByClaimId(claimId).stream()
                .map(ClaimDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimDocumentDto reviewDocument(Long documentId, Long officerId, ReviewDocumentDto dto) {
        ClaimDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        Claim claim = doc.getClaim();
        if (officer.getRole() == Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(officerId)) {
                throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only review documents for claims assigned to you");
            }
        }

        doc.setReviewStatus(dto.getStatus());
        doc.setOfficerRemarks(dto.getRemarks());
        ClaimDocument saved = documentRepository.save(doc);

        timelineRepository.save(new ClaimTimelineEvent(
                claim,
                "Document " + dto.getStatus(),
                officer,
                officer.getFullName(),
                doc.getFileName() + " marked as " + dto.getStatus() + (dto.getRemarks() != null ? ": " + dto.getRemarks() : "")
        ));

        // Notify customer
        if (claim.getCustomer() != null) {
            notificationRepository.save(new Notification(
                    claim.getCustomer(),
                    "Document " + dto.getStatus(),
                    claim.getClaimNumber() + " - " + doc.getFileName() + " has been " + dto.getStatus().toLowerCase(),
                    "DOCUMENT",
                    "/customer/claims/" + claim.getId()
            ));
        }

        return ClaimDocumentDto.fromEntity(saved);
    }

    @Transactional
    public RequestDocumentDto requestAdditionalDocument(Long claimId, Long officerId, RequestDocumentDto dto) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found with id: " + claimId));
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.getRole() == Role.CLAIM_OFFICER) {
            if (claim.getAssignedOfficer() == null || !claim.getAssignedOfficer().getId().equals(officerId)) {
                throw new com.adz4needz.claimdesk.exception.UnauthorizedException("Access denied: You can only request documents for claims assigned to you");
            }
        }

        DocumentRequest req = new DocumentRequest();
        req.setClaim(claim);
        req.setOfficer(officer);
        req.setDocumentType(dto.getDocumentType());
        req.setIsMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true);
        req.setRemarks(dto.getRemarks());
        req.setDueDate(dto.getDueDate());
        req.setStatus("PENDING");

        DocumentRequest saved = requestRepository.save(req);

        // Update claim status to "Documents Required"
        claim.setStatus("Documents Required");
        claimRepository.save(claim);

        // Timeline event
        timelineRepository.save(new ClaimTimelineEvent(
                claim,
                "Documents Requested",
                officer,
                officer.getFullName(),
                "Requested: " + dto.getDocumentType() + " - " + dto.getRemarks()
        ));

        // Notify customer
        if (claim.getCustomer() != null) {
            notificationRepository.save(new Notification(
                    claim.getCustomer(),
                    "Additional documents requested",
                    claim.getClaimNumber() + " - Please upload " + dto.getDocumentType(),
                    "DOCUMENT",
                    "/customer/claims/" + claim.getId()
            ));
        }

        return RequestDocumentDto.fromEntity(saved);
    }

    public List<RequestDocumentDto> getDocumentRequests(Long claimId) {
        return requestRepository.findByClaimId(claimId).stream()
                .map(RequestDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        ClaimDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        // Verify the requesting user is the uploader or an admin/officer on the claim
        User requestingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Claim claim = doc.getClaim();
        boolean allowed = false;

        if (requestingUser.getRole() == com.adz4needz.claimdesk.entity.Role.ADMIN) {
            allowed = true;
        } else if (requestingUser.getRole() == com.adz4needz.claimdesk.entity.Role.CLAIM_OFFICER) {
            // Officers can delete documents on claims assigned to them
            allowed = claim.getAssignedOfficer() != null && claim.getAssignedOfficer().getId().equals(userId);
        } else if (requestingUser.getRole() == com.adz4needz.claimdesk.entity.Role.CUSTOMER) {
            // Customers can only delete their own uploads on claims in editable states
            boolean isUploader = doc.getUploadedBy() != null && doc.getUploadedBy().getId().equals(userId);
            boolean isOwnClaim = claim.getCustomer() != null && claim.getCustomer().getId().equals(userId);
            boolean isEditableStatus = "Draft".equalsIgnoreCase(claim.getStatus())
                    || "Submitted".equalsIgnoreCase(claim.getStatus())
                    || "Documents Required".equalsIgnoreCase(claim.getStatus());
            allowed = isUploader && isOwnClaim && isEditableStatus;
        }

        if (!allowed) {
            throw new com.adz4needz.claimdesk.exception.UnauthorizedException("You do not have permission to delete this document");
        }

        // Attempt to delete the physical file
        try {
            Path filePath = this.fileStorageLocation.resolve(doc.getStoredPath()).normalize();
            java.nio.file.Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log but don't fail the operation
            System.err.println("Warning: Could not delete physical file: " + doc.getStoredPath());
        }

        documentRepository.delete(doc);
    }
}
