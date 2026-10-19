package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportExportService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final ClaimAssessmentRepository assessmentRepository;
    private final SettlementRepository settlementRepository;
    private final ClaimDocumentRepository documentRepository;
    private final UserRepository userRepository;

    public ReportExportService(ClaimRepository claimRepository,
                               PolicyRepository policyRepository,
                               ClaimAssessmentRepository assessmentRepository,
                               SettlementRepository settlementRepository,
                               ClaimDocumentRepository documentRepository,
                               UserRepository userRepository) {
        this.claimRepository = claimRepository;
        this.policyRepository = policyRepository;
        this.assessmentRepository = assessmentRepository;
        this.settlementRepository = settlementRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    public String exportCsv(String reportType) throws IOException {
        StringWriter writer = new StringWriter();

        switch (reportType.toLowerCase()) {
            case "assessments":
            case "assessment records":
                exportAssessmentsCsv(writer);
                break;
            case "settlements":
            case "settlement records":
                exportSettlementsCsv(writer);
                break;
            case "documents":
            case "document records":
                exportDocumentsCsv(writer);
                break;
            case "duration":
            case "processing duration":
                exportDurationCsv(writer);
                break;
            case "claims":
            default:
                exportClaimsCsv(writer);
                break;
        }

        return writer.toString();
    }

    private void exportClaimsCsv(StringWriter writer) throws IOException {
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Claim Number", "Customer Name", "Customer Email", "Policy Number", "Claim Type",
                "Incident Date", "Estimated Loss", "Requested Amount", "Status", "Priority",
                "Assigned Officer", "Submitted On"
        ));

        List<Claim> claims = claimRepository.findAll();
        for (Claim c : claims) {
            csvPrinter.printRecord(
                    c.getClaimNumber(),
                    c.getCustomer() != null ? c.getCustomer().getFullName() : "",
                    c.getCustomer() != null ? c.getCustomer().getEmail() : "",
                    c.getPolicy() != null ? c.getPolicy().getPolicyNumber() : "",
                    c.getClaimType(),
                    c.getIncidentDate(),
                    c.getEstimatedLoss(),
                    c.getRequestedAmount(),
                    c.getStatus(),
                    c.getPriority(),
                    c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned",
                    c.getCreatedAt()
            );
        }
        csvPrinter.flush();
    }

    private void exportAssessmentsCsv(StringWriter writer) throws IOException {
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Assessment ID", "Claim Number", "Assessed Officer", "Assessment Date",
                "Assessed Loss", "Eligible Amount", "Non-Eligible Amount", "Recommendation", "Remarks"
        ));
        List<ClaimAssessment> assessments = assessmentRepository.findAll();
        for (ClaimAssessment a : assessments) {
            csvPrinter.printRecord(
                    a.getId(),
                    a.getClaim() != null ? a.getClaim().getClaimNumber() : "",
                    a.getOfficer() != null ? a.getOfficer().getFullName() : "",
                    a.getAssessmentDate(),
                    a.getAssessedLoss(),
                    a.getEligibleAmount(),
                    a.getNonEligibleAmount(),
                    a.getRecommendation(),
                    a.getRemarks()
            );
        }
        csvPrinter.flush();
    }

    private void exportSettlementsCsv(StringWriter writer) throws IOException {
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Settlement ID", "Claim Number", "Approved Amount", "Settlement Amount",
                "Settlement Date", "Settlement Reference", "Status", "Remarks"
        ));
        List<Settlement> settlements = settlementRepository.findAll();
        for (Settlement s : settlements) {
            csvPrinter.printRecord(
                    s.getId(),
                    s.getClaim() != null ? s.getClaim().getClaimNumber() : "",
                    s.getApprovedAmount(),
                    s.getSettlementAmount(),
                    s.getSettlementDate(),
                    s.getSettlementReference(),
                    s.getStatus(),
                    s.getRemarks()
            );
        }
        csvPrinter.flush();
    }

    private void exportDocumentsCsv(StringWriter writer) throws IOException {
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Document ID", "Claim Number", "Document Type", "File Name", "File Size",
                "Is Photo", "Review Status", "Uploaded By", "Upload Date", "Remarks"
        ));
        List<ClaimDocument> docs = documentRepository.findAll();
        for (ClaimDocument d : docs) {
            csvPrinter.printRecord(
                    d.getId(),
                    d.getClaim() != null ? d.getClaim().getClaimNumber() : "",
                    d.getDocumentType(),
                    d.getFileName(),
                    d.getFileSize(),
                    d.getIsPhoto(),
                    d.getReviewStatus(),
                    d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : "",
                    d.getUploadDate(),
                    d.getOfficerRemarks()
            );
        }
        csvPrinter.flush();
    }

    private void exportDurationCsv(StringWriter writer) throws IOException {
        CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Claim Number", "Claim Type", "Current Status", "Submitted Date", "Days Since Submission", "Assigned Officer"
        ));
        List<Claim> claims = claimRepository.findAll();
        for (Claim c : claims) {
            long days = (c.getCreatedAt() != null) ? ChronoUnit.DAYS.between(c.getCreatedAt().toLocalDate(), java.time.LocalDate.now()) : 0;
            csvPrinter.printRecord(
                    c.getClaimNumber(),
                    c.getClaimType(),
                    c.getStatus(),
                    c.getCreatedAt(),
                    days,
                    c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned"
            );
        }
        csvPrinter.flush();
    }

    public ByteArrayInputStream exportExcel(String reportType) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(reportType.substring(0, Math.min(25, reportType.length())));

            // Header Font & Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"Claim Number", "Customer", "Policy", "Type", "Status", "Requested Amount", "Assigned Officer", "Submitted On"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Claim> claims = claimRepository.findAll();
            int rowIdx = 1;
            for (Claim c : claims) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(c.getClaimNumber());
                row.createCell(1).setCellValue(c.getCustomer() != null ? c.getCustomer().getFullName() : "");
                row.createCell(2).setCellValue(c.getPolicy() != null ? c.getPolicy().getPolicyNumber() : "");
                row.createCell(3).setCellValue(c.getClaimType());
                row.createCell(4).setCellValue(c.getStatus());
                row.createCell(5).setCellValue(c.getRequestedAmount() != null ? c.getRequestedAmount().doubleValue() : 0.0);
                row.createCell(6).setCellValue(c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned");
                row.createCell(7).setCellValue(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
