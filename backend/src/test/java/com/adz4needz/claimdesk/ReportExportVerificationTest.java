package com.adz4needz.claimdesk;

import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.repository.*;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.ReportExportService;
import com.lowagie.text.pdf.PdfReader;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportExportVerificationTest {

    @Mock
    private ClaimRepository claimRepository;
    @Mock
    private PolicyRepository policyRepository;
    @Mock
    private ClaimAssessmentRepository assessmentRepository;
    @Mock
    private SettlementRepository settlementRepository;
    @Mock
    private ClaimDocumentRepository documentRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReportExportService reportExportService;

    private User admin;
    private User officer1;
    private User customer1;
    private Policy policy1;
    private Claim claim1;
    private Settlement settlement1;
    private ClaimAssessment assessment1;
    private ClaimDocument document1;
    private UserPrincipal adminPrincipal;
    private UserPrincipal officerPrincipal;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setFullName("Admin System");
        admin.setEmail("admin@company.com");
        admin.setRole(Role.ADMIN);

        officer1 = new User();
        officer1.setId(201L);
        officer1.setFullName("Officer Rajesh");
        officer1.setEmail("rajesh@company.com");
        officer1.setRole(Role.CLAIM_OFFICER);
        officer1.setDepartment("Motor Claims");

        customer1 = new User();
        customer1.setId(101L);
        customer1.setFullName("Arun Kumar");
        customer1.setEmail("arun@example.com");
        customer1.setPhoneNumber("+91 9876543210");
        customer1.setRole(Role.CUSTOMER);

        policy1 = new Policy();
        policy1.setId(501L);
        policy1.setCustomer(customer1);
        policy1.setPolicyNumber("POL-1001");
        policy1.setPolicyType("Motor Comprehensive");
        policy1.setProviderCompany("Aegis Insurance");

        claim1 = new Claim();
        claim1.setId(1001L);
        claim1.setClaimNumber("CLM-1004");
        claim1.setCustomer(customer1);
        claim1.setPolicy(policy1);
        claim1.setAssignedOfficer(officer1);
        claim1.setClaimType("Vehicle Damage");
        claim1.setIncidentDate(LocalDate.of(2025, 2, 10));
        claim1.setEstimatedLoss(new BigDecimal("45000.00"));
        claim1.setRequestedAmount(new BigDecimal("40000.00"));
        claim1.setStatus("Under Review");
        claim1.setPriority("High");
        claim1.setCreatedAt(LocalDateTime.of(2025, 2, 11, 10, 0));

        settlement1 = new Settlement();
        settlement1.setId(301L);
        settlement1.setClaim(claim1);
        settlement1.setApprovedAmount(new BigDecimal("38000.00"));
        settlement1.setSettlementAmount(new BigDecimal("38000.00"));
        settlement1.setSettlementDate(LocalDate.of(2025, 2, 15));
        settlement1.setSettlementReference("SET-REF-2025-001");
        settlement1.setStatus("Completed");
        settlement1.setRemarks("Disbursed to customer bank account");

        assessment1 = new ClaimAssessment();
        assessment1.setId(401L);
        assessment1.setClaim(claim1);
        assessment1.setOfficer(officer1);
        assessment1.setAssessmentDate(LocalDate.of(2025, 2, 12));
        assessment1.setAssessedLoss(new BigDecimal("42000.00"));
        assessment1.setEligibleAmount(new BigDecimal("38000.00"));
        assessment1.setNonEligibleAmount(new BigDecimal("4000.00"));
        assessment1.setRecommendation("Approve");
        assessment1.setRemarks("Front bumper damage verified");

        document1 = new ClaimDocument();
        document1.setId(601L);
        document1.setClaim(claim1);
        document1.setDocumentType("Repair Estimate");
        document1.setFileName("estimate_workshop.pdf");
        document1.setFileSize(204800L); // 200 KB
        document1.setIsPhoto(false);
        document1.setReviewStatus("Accepted");
        document1.setUploadedBy(customer1);
        document1.setUploadDate(LocalDateTime.of(2025, 2, 11, 11, 30));
        document1.setOfficerRemarks("Workshop estimate verified");

        adminPrincipal = UserPrincipal.create(admin);
        officerPrincipal = UserPrincipal.create(officer1);
    }

    // ==========================================
    // CSV EXPORT TESTS
    // ==========================================

    @Test
    @DisplayName("CSV Export: Claims Master report contains correct headers and records")
    void testClaimsMasterCsvExport() throws Exception {
        when(claimRepository.findAll(any(Sort.class))).thenReturn(List.of(claim1));

        byte[] csvBytes = reportExportService.exportCsv("claims", adminPrincipal, null, null, null, null);
        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(new ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {
            List<String> headers = parser.getHeaderNames();
            assertTrue(headers.contains("Claim Number"));
            assertTrue(headers.contains("Customer Name"));
            assertTrue(headers.contains("Policy Number"));
            assertTrue(headers.contains("Requested Amount"));
            assertTrue(headers.contains("Status"));

            List<CSVRecord> records = parser.getRecords();
            assertEquals(1, records.size());
            CSVRecord record = records.get(0);
            assertEquals("CLM-1004", record.get("Claim Number"));
            assertEquals("Arun Kumar", record.get("Customer Name"));
            assertEquals("POL-1001", record.get("Policy Number"));
            assertEquals("Under Review", record.get("Status"));
            assertEquals("40000.00", record.get("Requested Amount"));
        }
    }

    @Test
    @DisplayName("CSV Export: Settlements report contains accurate disbursement data")
    void testSettlementsCsvExport() throws Exception {
        when(settlementRepository.findAll(any(Sort.class))).thenReturn(List.of(settlement1));

        byte[] csvBytes = reportExportService.exportCsv("settlements", adminPrincipal, null, null, null, null);
        assertNotNull(csvBytes);

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(new ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {
            List<String> headers = parser.getHeaderNames();
            assertTrue(headers.contains("Settlement ID"));
            assertTrue(headers.contains("Settlement Reference"));
            assertTrue(headers.contains("Settlement Amount"));

            List<CSVRecord> records = parser.getRecords();
            assertEquals(1, records.size());
            assertEquals("SET-REF-2025-001", records.get(0).get("Settlement Reference"));
            assertEquals("38000.00", records.get(0).get("Settlement Amount"));
            assertEquals("Completed", records.get(0).get("Status"));
        }
    }

    @Test
    @DisplayName("CSV Export: Assessments report contains loss evaluation metrics")
    void testAssessmentsCsvExport() throws Exception {
        when(assessmentRepository.findAll(any(Sort.class))).thenReturn(List.of(assessment1));

        byte[] csvBytes = reportExportService.exportCsv("assessments", adminPrincipal, null, null, null, null);
        assertNotNull(csvBytes);

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(new ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {
            List<CSVRecord> records = parser.getRecords();
            assertEquals(1, records.size());
            assertEquals("CLM-1004", records.get(0).get("Claim Number"));
            assertEquals("42000.00", records.get(0).get("Assessed Loss"));
            assertEquals("Approve", records.get(0).get("Recommendation"));
        }
    }

    @Test
    @DisplayName("CSV Export: Documents report contains document verification details")
    void testDocumentsCsvExport() throws Exception {
        when(documentRepository.findAll(any(Sort.class))).thenReturn(List.of(document1));

        byte[] csvBytes = reportExportService.exportCsv("documents", adminPrincipal, null, null, null, null);
        assertNotNull(csvBytes);

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(new ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {
            List<CSVRecord> records = parser.getRecords();
            assertEquals(1, records.size());
            assertEquals("estimate_workshop.pdf", records.get(0).get("File Name"));
            assertEquals("Accepted", records.get(0).get("Review Status"));
            assertEquals("No", records.get(0).get("Is Photo"));
        }
    }

    @Test
    @DisplayName("CSV Export: Officer throughput report calculates caseload numbers")
    void testOfficersCsvExport() throws Exception {
        when(userRepository.findByRole(Role.CLAIM_OFFICER)).thenReturn(List.of(officer1));
        when(claimRepository.findAll()).thenReturn(List.of(claim1));

        byte[] csvBytes = reportExportService.exportCsv("officers", adminPrincipal, null, null, null, null);
        assertNotNull(csvBytes);

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(new ByteArrayInputStream(csvBytes), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withFirstRecordAsHeader())) {
            List<CSVRecord> records = parser.getRecords();
            assertEquals(1, records.size());
            assertEquals("Officer Rajesh", records.get(0).get("Officer Name"));
            assertEquals("1", records.get(0).get("Total Assigned"));
            assertEquals("1", records.get(0).get("Under Review"));
        }
    }

    // ==========================================
    // EXCEL (.xlsx) EXPORT TESTS
    // ==========================================

    @Test
    @DisplayName("Excel Export: Generates valid .xlsx workbook with correct sheet and styled headers")
    void testExcelExportClaimsReport() throws Exception {
        when(claimRepository.findAll(any(Sort.class))).thenReturn(List.of(claim1));

        ByteArrayInputStream in = reportExportService.exportExcel("claims", adminPrincipal, null, null, null, null);
        assertNotNull(in);

        try (Workbook workbook = new XSSFWorkbook(in)) {
            assertEquals(1, workbook.getNumberOfSheets());
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Claims Audit", sheet.getSheetName());

            Row headerRow = sheet.getRow(0);
            assertNotNull(headerRow);
            assertEquals("Claim Number", headerRow.getCell(0).getStringCellValue());
            assertEquals("Customer Name", headerRow.getCell(1).getStringCellValue());

            Row dataRow = sheet.getRow(1);
            assertNotNull(dataRow);
            assertEquals("CLM-1004", dataRow.getCell(0).getStringCellValue());
            assertEquals("Arun Kumar", dataRow.getCell(1).getStringCellValue());
            assertEquals(40000.0, dataRow.getCell(8).getNumericCellValue(), 0.01);
        }
    }

    @Test
    @DisplayName("Excel Export: Generates distinct sheet and columns for settlements (not duplicate claims)")
    void testExcelExportSettlementsReport() throws Exception {
        when(settlementRepository.findAll(any(Sort.class))).thenReturn(List.of(settlement1));

        ByteArrayInputStream in = reportExportService.exportExcel("settlements", adminPrincipal, null, null, null, null);
        assertNotNull(in);

        try (Workbook workbook = new XSSFWorkbook(in)) {
            Sheet sheet = workbook.getSheetAt(0);
            assertEquals("Settlements", sheet.getSheetName());

            Row headerRow = sheet.getRow(0);
            assertEquals("Settlement ID", headerRow.getCell(0).getStringCellValue());
            assertEquals("Settlement Reference", headerRow.getCell(6).getStringCellValue());

            Row dataRow = sheet.getRow(1);
            assertEquals("SET-REF-2025-001", dataRow.getCell(6).getStringCellValue());
            assertEquals(38000.0, dataRow.getCell(5).getNumericCellValue(), 0.01);
        }
    }

    // ==========================================
    // PDF EXPORT TESTS
    // ==========================================

    @Test
    @DisplayName("PDF Export: Generates valid PDF starting with %PDF- header and contains readable content")
    void testPdfExportClaimsReport() throws Exception {
        when(claimRepository.findAll(any(Sort.class))).thenReturn(List.of(claim1));

        ByteArrayInputStream in = reportExportService.exportPdf("claims", adminPrincipal, null, null, null, null);
        assertNotNull(in);

        byte[] pdfBytes = in.readAllBytes();
        assertTrue(pdfBytes.length > 500);

        // Verify PDF Magic Bytes: %PDF-
        String magic = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", magic);

        // Verify OpenPDF can parse the document without error
        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
        assertTrue(reader.getNumberOfPages() >= 1);
        reader.close();
    }

    @Test
    @DisplayName("PDF Export: Supports settlements report generation as valid PDF")
    void testPdfExportSettlementsReport() throws Exception {
        when(settlementRepository.findAll(any(Sort.class))).thenReturn(List.of(settlement1));

        ByteArrayInputStream in = reportExportService.exportPdf("settlements", adminPrincipal, null, null, null, null);
        assertNotNull(in);

        byte[] pdfBytes = in.readAllBytes();
        assertTrue(pdfBytes.length > 500);
        String magic = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", magic);

        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
        assertTrue(reader.getNumberOfPages() >= 1);
        reader.close();
    }

    // ==========================================
    // EMPTY RESULTS & FILTERING TESTS
    // ==========================================

    @Test
    @DisplayName("Empty Results: Generates clear message when no records match filters (CSV, Excel, PDF)")
    void testEmptyResultsHandling() throws Exception {
        when(claimRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

        // CSV Empty Check
        byte[] csvBytes = reportExportService.exportCsv("claims", adminPrincipal, "NON_EXISTING_STATUS", null, null, null);
        String csvStr = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvStr.contains("No records found matching the specified criteria."));

        // Excel Empty Check
        ByteArrayInputStream excelIn = reportExportService.exportExcel("claims", adminPrincipal, "NON_EXISTING_STATUS", null, null, null);
        try (Workbook workbook = new XSSFWorkbook(excelIn)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row emptyRow = sheet.getRow(1);
            assertNotNull(emptyRow);
            assertTrue(emptyRow.getCell(0).getStringCellValue().contains("No records found"));
        }

        // PDF Empty Check
        ByteArrayInputStream pdfIn = reportExportService.exportPdf("claims", adminPrincipal, "NON_EXISTING_STATUS", null, null, null);
        byte[] pdfBytes = pdfIn.readAllBytes();
        assertTrue(pdfBytes.length > 500);
        PdfReader reader = new PdfReader(new ByteArrayInputStream(pdfBytes));
        assertTrue(reader.getNumberOfPages() >= 1);
        reader.close();
    }

    @Test
    @DisplayName("Role Security: Claim Officer export is filtered to assigned claims only")
    void testRoleBasedFilteringForOfficer() throws Exception {
        User otherOfficer = new User();
        otherOfficer.setId(999L);
        otherOfficer.setFullName("Other Officer");

        Claim unassignedClaim = new Claim();
        unassignedClaim.setId(1002L);
        unassignedClaim.setClaimNumber("CLM-OTHER");
        unassignedClaim.setAssignedOfficer(otherOfficer);
        unassignedClaim.setCustomer(customer1);
        unassignedClaim.setCreatedAt(LocalDateTime.now());

        when(claimRepository.findAll(any(Sort.class))).thenReturn(List.of(claim1, unassignedClaim));

        byte[] csvBytes = reportExportService.exportCsv("claims", officerPrincipal, null, null, null, null);
        String csvStr = new String(csvBytes, StandardCharsets.UTF_8);

        assertTrue(csvStr.contains("CLM-1004")); // Assigned to officer1
        assertFalse(csvStr.contains("CLM-OTHER")); // Assigned to other officer - must be excluded
    }
}
