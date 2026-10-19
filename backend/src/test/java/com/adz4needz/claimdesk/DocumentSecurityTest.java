package com.adz4needz.claimdesk;

import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.exception.BadRequestException;
import com.adz4needz.claimdesk.exception.UnauthorizedException;
import com.adz4needz.claimdesk.repository.*;
import com.adz4needz.claimdesk.service.DocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DocumentSecurityTest {

    @Mock
    private ClaimDocumentRepository documentRepository;
    @Mock
    private DocumentRequestRepository requestRepository;
    @Mock
    private ClaimRepository claimRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ClaimTimelineEventRepository timelineRepository;
    @Mock
    private NotificationRepository notificationRepository;

    private DocumentService documentService;

    private User customer1;
    private User customer2;
    private User officer1;
    private User officer2;
    private Claim claim1;

    @BeforeEach
    void setUp() {
        documentService = new DocumentService(
                "./uploads_test",
                documentRepository,
                requestRepository,
                claimRepository,
                userRepository,
                timelineRepository,
                notificationRepository
        );

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

        claim1 = new Claim();
        claim1.setId(1001L);
        claim1.setClaimNumber("CLM-1001");
        claim1.setCustomer(customer1);
        claim1.setAssignedOfficer(officer1);
        claim1.setStatus("Under Review");
    }

    @Test
    void customer_cannotUploadToAnotherCustomersClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(customer2.getId())).thenReturn(Optional.of(customer2));

        MockMultipartFile file = new MockMultipartFile(
                "file", "bill.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        assertThrows(UnauthorizedException.class, () -> {
            documentService.uploadClaimFile(1001L, customer2.getId(), "Repair Estimate", false, null, "Bill", file);
        });
    }

    @Test
    void officer_cannotUploadToUnassignedClaim() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(officer2.getId())).thenReturn(Optional.of(officer2));

        MockMultipartFile file = new MockMultipartFile(
                "file", "bill.pdf", "application/pdf", "dummy pdf content".getBytes()
        );

        assertThrows(UnauthorizedException.class, () -> {
            documentService.uploadClaimFile(1001L, officer2.getId(), "Inspection Report", false, null, "Report", file);
        });
    }

    @Test
    void upload_rejectsPathTraversalInFileName() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(customer1.getId())).thenReturn(Optional.of(customer1));

        MockMultipartFile file = new MockMultipartFile(
                "file", "../../../../etc/passwd.pdf", "application/pdf", "content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            documentService.uploadClaimFile(1001L, customer1.getId(), "Doc", false, null, "Desc", file);
        });
    }

    @Test
    void upload_rejectsDisallowedFileExtension() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(customer1.getId())).thenReturn(Optional.of(customer1));

        MockMultipartFile file = new MockMultipartFile(
                "file", "exploit.exe", "application/octet-stream", "malicious payload".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            documentService.uploadClaimFile(1001L, customer1.getId(), "Doc", false, null, "Desc", file);
        });
    }

    @Test
    void upload_rejectsInsecureMimeType() {
        when(claimRepository.findById(1001L)).thenReturn(Optional.of(claim1));
        when(userRepository.findById(customer1.getId())).thenReturn(Optional.of(customer1));

        MockMultipartFile file = new MockMultipartFile(
                "file", "script.pdf", "text/javascript", "alert(1)".getBytes()
        );

        assertThrows(BadRequestException.class, () -> {
            documentService.uploadClaimFile(1001L, customer1.getId(), "Doc", false, null, "Desc", file);
        });
    }

    @Test
    void customer_cannotDeleteAnotherCustomersDocument() {
        ClaimDocument doc = new ClaimDocument();
        doc.setId(5001L);
        doc.setClaim(claim1);
        doc.setUploadedBy(customer1);
        doc.setStoredPath("claim_CLM-1001/doc.pdf");

        when(documentRepository.findById(5001L)).thenReturn(Optional.of(doc));
        when(userRepository.findById(customer2.getId())).thenReturn(Optional.of(customer2));

        assertThrows(UnauthorizedException.class, () -> {
            documentService.deleteDocument(5001L, customer2.getId());
        });
    }

    @Test
    void customer_cannotDeleteDocumentOnSettledClaim() {
        claim1.setStatus("Settled");

        ClaimDocument doc = new ClaimDocument();
        doc.setId(5001L);
        doc.setClaim(claim1);
        doc.setUploadedBy(customer1);
        doc.setStoredPath("claim_CLM-1001/doc.pdf");

        when(documentRepository.findById(5001L)).thenReturn(Optional.of(doc));
        when(userRepository.findById(customer1.getId())).thenReturn(Optional.of(customer1));

        assertThrows(UnauthorizedException.class, () -> {
            documentService.deleteDocument(5001L, customer1.getId());
        });
    }
}
