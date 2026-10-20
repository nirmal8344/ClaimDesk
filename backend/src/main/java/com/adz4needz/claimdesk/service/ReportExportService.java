package com.adz4needz.claimdesk.service;

import com.adz4needz.claimdesk.entity.*;
import com.adz4needz.claimdesk.repository.*;
import com.adz4needz.claimdesk.security.UserPrincipal;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
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

    // ==========================================
    // Backward-Compatible Overloads
    // ==========================================

    public String exportCsv(String reportType) throws IOException {
        byte[] bytes = exportCsv(reportType, null, null, null, null, null);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    public ByteArrayInputStream exportExcel(String reportType) throws IOException {
        return exportExcel(reportType, null, null, null, null, null);
    }

    public ByteArrayInputStream exportPdf(String reportType) throws IOException {
        return exportPdf(reportType, null, null, null, null, null);
    }

    // ==========================================
    // Parameterized Export Methods
    // ==========================================

    public byte[] exportCsv(String reportType, UserPrincipal currentUser, String status,
                            LocalDate startDate, LocalDate endDate, Long customerId) throws IOException {
        ReportData data = buildReportData(reportType, currentUser, status, startDate, endDate, customerId);

        StringWriter writer = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(data.headers))) {
            if (data.rows.isEmpty()) {
                // Meaningful message for empty result set
                String[] emptyRow = new String[data.headers.length];
                Arrays.fill(emptyRow, "");
                emptyRow[0] = "No records found matching the specified criteria.";
                printer.printRecord((Object[]) emptyRow);
            } else {
                for (List<Object> row : data.rows) {
                    List<Object> formattedRow = new ArrayList<>();
                    for (int i = 0; i < row.size(); i++) {
                        Object val = row.get(i);
                        if (val instanceof BigDecimal) {
                            formattedRow.add(String.format(Locale.US, "%.2f", ((BigDecimal) val).doubleValue()));
                        } else if (val instanceof Double) {
                            formattedRow.add(String.format(Locale.US, "%.2f", (Double) val));
                        } else {
                            formattedRow.add(val != null ? val.toString() : "");
                        }
                    }
                    printer.printRecord(formattedRow);
                }
            }
            printer.flush();
        }
        return writer.toString().getBytes(StandardCharsets.UTF_8);
    }

    public ByteArrayInputStream exportExcel(String reportType, UserPrincipal currentUser, String status,
                                           LocalDate startDate, LocalDate endDate, Long customerId) throws IOException {
        ReportData data = buildReportData(reportType, currentUser, status, startDate, endDate, customerId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(data.sheetName);

            // Styles
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            DataFormat format = workbook.createDataFormat();

            CellStyle currencyStyle = workbook.createCellStyle();
            currencyStyle.setDataFormat(format.getFormat("₹ #,##0.00"));
            currencyStyle.setAlignment(HorizontalAlignment.RIGHT);
            currencyStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            currencyStyle.setBorderBottom(BorderStyle.THIN);
            currencyStyle.setBorderTop(BorderStyle.THIN);
            currencyStyle.setBorderLeft(BorderStyle.THIN);
            currencyStyle.setBorderRight(BorderStyle.THIN);

            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            centerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            centerStyle.setBorderBottom(BorderStyle.THIN);
            centerStyle.setBorderTop(BorderStyle.THIN);
            centerStyle.setBorderLeft(BorderStyle.THIN);
            centerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle textStyle = workbook.createCellStyle();
            textStyle.setAlignment(HorizontalAlignment.LEFT);
            textStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            textStyle.setBorderBottom(BorderStyle.THIN);
            textStyle.setBorderTop(BorderStyle.THIN);
            textStyle.setBorderLeft(BorderStyle.THIN);
            textStyle.setBorderRight(BorderStyle.THIN);

            // Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(24);
            for (int i = 0; i < data.headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(data.headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            if (data.rows.isEmpty()) {
                Row emptyRow = sheet.createRow(rowIdx);
                Cell cell = emptyRow.createCell(0);
                cell.setCellValue("No records found matching the specified criteria.");
                org.apache.poi.ss.usermodel.Font italicFont = workbook.createFont();
                italicFont.setItalic(true);
                italicFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
                CellStyle emptyStyle = workbook.createCellStyle();
                emptyStyle.setFont(italicFont);
                cell.setCellStyle(emptyStyle);
            } else {
                for (List<Object> rowData : data.rows) {
                    Row row = sheet.createRow(rowIdx++);
                    row.setHeightInPoints(20);
                    for (int col = 0; col < rowData.size(); col++) {
                        Cell cell = row.createCell(col);
                        Object val = rowData.get(col);
                        boolean isCurrency = col < data.currencyColumns.length && data.currencyColumns[col];
                        boolean isDate = col < data.dateColumns.length && data.dateColumns[col];

                        if (isCurrency && val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                            cell.setCellStyle(currencyStyle);
                        } else if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                            cell.setCellStyle(centerStyle);
                        } else if (isDate) {
                            cell.setCellValue(val != null ? val.toString() : "");
                            cell.setCellStyle(centerStyle);
                        } else {
                            cell.setCellValue(val != null ? val.toString() : "");
                            cell.setCellStyle(textStyle);
                        }
                    }
                }
            }

            // Auto-size columns with sensible padding
            for (int i = 0; i < data.headers.length; i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(Math.max(currentWidth + 1200, 3600), 16000));
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream exportPdf(String reportType, UserPrincipal currentUser, String status,
                                         LocalDate startDate, LocalDate endDate, Long customerId) throws IOException {
        ReportData data = buildReportData(reportType, currentUser, status, startDate, endDate, customerId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 24, 24, 28, 30);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfPageFooterEvent());
            document.open();

            // Document Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, new Color(30, 41, 59));
            Paragraph title = new Paragraph("ClaimDesk Enterprise — " + data.title, titleFont);
            title.setSpacingAfter(3);
            document.add(title);

            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, new Color(100, 116, 139));
            String genDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String userStr = currentUser != null ? currentUser.getUsername() + " (" + currentUser.getRole() + ")" : "System";
            Paragraph meta = new Paragraph("Generated On: " + genDate + "  |  User: " + userStr + "  |  " + data.filterDescription, metaFont);
            meta.setSpacingAfter(14);
            document.add(meta);

            if (data.rows.isEmpty()) {
                Font emptyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC, new Color(100, 116, 139));
                Paragraph emptyPara = new Paragraph("No records found matching the specified criteria.", emptyFont);
                emptyPara.setSpacingBefore(30);
                emptyPara.setAlignment(Element.ALIGN_CENTER);
                document.add(emptyPara);
            } else {
                PdfPTable table = new PdfPTable(data.headers.length);
                table.setWidthPercentage(100);
                table.setHeaderRows(1); // Repeat header on subsequent pages!

                Font headerPdfFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
                Color headerBg = new Color(30, 41, 59);

                for (int i = 0; i < data.headers.length; i++) {
                    PdfPCell cell = new PdfPCell(new Phrase(data.headers[i], headerPdfFont));
                    cell.setBackgroundColor(headerBg);
                    cell.setPadding(6f);
                    boolean isCurr = i < data.currencyColumns.length && data.currencyColumns[i];
                    cell.setHorizontalAlignment(isCurr ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
                    cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                    table.addCell(cell);
                }

                Font dataPdfFont = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, new Color(15, 23, 42));
                Color altBg = new Color(248, 250, 252);
                Color borderColor = new Color(226, 232, 240);

                for (int r = 0; r < data.rows.size(); r++) {
                    List<Object> rowData = data.rows.get(r);
                    Color rowBg = (r % 2 == 1) ? altBg : Color.WHITE;

                    for (int c = 0; c < rowData.size(); c++) {
                        Object val = rowData.get(c);
                        boolean isCurrency = c < data.currencyColumns.length && data.currencyColumns[c];
                        boolean isDate = c < data.dateColumns.length && data.dateColumns[c];

                        String text;
                        if (isCurrency && val instanceof Number) {
                            text = String.format(Locale.US, "₹ %,.2f", ((Number) val).doubleValue());
                        } else {
                            text = (val != null) ? val.toString() : "";
                        }

                        PdfPCell cell = new PdfPCell(new Phrase(text, dataPdfFont));
                        cell.setBackgroundColor(rowBg);
                        cell.setBorderColor(borderColor);
                        cell.setPadding(4.5f);

                        if (isCurrency) {
                            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                        } else if (isDate || (data.headers[c].contains("Status") || data.headers[c].contains("Priority") || data.headers[c].contains("ID"))) {
                            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                        } else {
                            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                        }
                        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                        table.addCell(cell);
                    }
                }

                document.add(table);
            }

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ==========================================
    // Unified Report Data Builder
    // ==========================================

    private ReportData buildReportData(String reportType, UserPrincipal currentUser, String status,
                                       LocalDate startDate, LocalDate endDate, Long customerId) {
        String norm = (reportType != null) ? reportType.trim().toLowerCase() : "claims";

        String filterDesc = buildFilterDescription(status, startDate, endDate, customerId);

        if (norm.contains("settlement") || norm.contains("payout") || norm.contains("disbursement")) {
            return buildSettlementsReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        } else if (norm.contains("assessment")) {
            return buildAssessmentsReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        } else if (norm.contains("document") || norm.contains("evidence")) {
            return buildDocumentsReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        } else if (norm.contains("officer") || norm.contains("throughput") || norm.contains("sla")) {
            return buildOfficersReport(currentUser, filterDesc);
        } else if (norm.contains("duration")) {
            return buildDurationReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        } else if (norm.contains("customer_claim") || norm.contains("customer_history") || norm.contains("customer claim")) {
            return buildCustomerClaimsReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        } else {
            return buildClaimsMasterReport(currentUser, status, startDate, endDate, customerId, filterDesc);
        }
    }

    private String buildFilterDescription(String status, LocalDate startDate, LocalDate endDate, Long customerId) {
        StringBuilder sb = new StringBuilder("Active Filters: ");
        sb.append("Status: ").append((status != null && !status.isBlank()) ? status : "ALL");
        if (startDate != null || endDate != null) {
            sb.append(" | Date Range: ").append(startDate != null ? startDate : "Beginning")
              .append(" to ").append(endDate != null ? endDate : "Present");
        } else {
            sb.append(" | Date Range: All Time");
        }
        if (customerId != null) {
            sb.append(" | Customer ID: ").append(customerId);
        }
        return sb.toString();
    }

    // 1. Claims Master Report
    private ReportData buildClaimsMasterReport(UserPrincipal currentUser, String status,
                                               LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Claim Number", "Customer Name", "Customer Email", "Policy Number", "Policy Type",
                "Claim Type", "Incident Date", "Estimated Loss", "Requested Amount",
                "Status", "Priority", "Assigned Officer", "Submitted On"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, false, true, true, false, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, true, false, false, false, false, false, true};

        List<Claim> claims = claimRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        claims = filterClaims(claims, currentUser, status, startDate, endDate, customerId);

        List<List<Object>> rows = new ArrayList<>();
        for (Claim c : claims) {
            rows.add(Arrays.asList(
                    c.getClaimNumber(),
                    c.getCustomer() != null ? c.getCustomer().getFullName() : "N/A",
                    c.getCustomer() != null ? c.getCustomer().getEmail() : "N/A",
                    c.getPolicy() != null ? c.getPolicy().getPolicyNumber() : "N/A",
                    c.getPolicy() != null ? c.getPolicy().getPolicyType() : "N/A",
                    c.getClaimType() != null ? c.getClaimType() : "N/A",
                    c.getIncidentDate() != null ? c.getIncidentDate().toString() : "",
                    c.getEstimatedLoss() != null ? c.getEstimatedLoss() : BigDecimal.ZERO,
                    c.getRequestedAmount() != null ? c.getRequestedAmount() : BigDecimal.ZERO,
                    c.getStatus() != null ? c.getStatus() : "Pending",
                    c.getPriority() != null ? c.getPriority() : "Medium",
                    c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned",
                    c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate().toString() : ""
            ));
        }

        return new ReportData("Claims Master Audit Trail", "Claims Audit", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 2. Customer Claims History Report
    private ReportData buildCustomerClaimsReport(UserPrincipal currentUser, String status,
                                                 LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Customer ID", "Customer Name", "Customer Email", "Customer Phone", "Claim Number",
                "Policy Number", "Claim Type", "Incident Date", "Requested Amount",
                "Status", "Assigned Officer", "Submitted On"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, false, false, true, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, false, true, false, false, false, true};

        List<Claim> claims = claimRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        claims = filterClaims(claims, currentUser, status, startDate, endDate, customerId);

        List<List<Object>> rows = new ArrayList<>();
        for (Claim c : claims) {
            rows.add(Arrays.asList(
                    c.getCustomer() != null ? c.getCustomer().getId().toString() : "N/A",
                    c.getCustomer() != null ? c.getCustomer().getFullName() : "N/A",
                    c.getCustomer() != null ? c.getCustomer().getEmail() : "N/A",
                    c.getCustomer() != null && c.getCustomer().getPhoneNumber() != null ? c.getCustomer().getPhoneNumber() : "N/A",
                    c.getClaimNumber(),
                    c.getPolicy() != null ? c.getPolicy().getPolicyNumber() : "N/A",
                    c.getClaimType() != null ? c.getClaimType() : "N/A",
                    c.getIncidentDate() != null ? c.getIncidentDate().toString() : "",
                    c.getRequestedAmount() != null ? c.getRequestedAmount() : BigDecimal.ZERO,
                    c.getStatus() != null ? c.getStatus() : "Pending",
                    c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned",
                    c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate().toString() : ""
            ));
        }

        return new ReportData("Customer Claim History Report", "Customer Claims", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 3. Claim Assessments Report
    private ReportData buildAssessmentsReport(UserPrincipal currentUser, String status,
                                              LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Assessment ID", "Claim Number", "Customer Name", "Policy Number", "Assessing Officer",
                "Assessment Date", "Assessed Loss", "Eligible Amount", "Non-Eligible Amount", "Recommendation", "Remarks"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, true, true, true, false, false};
        boolean[] isDate = {false, false, false, false, false, true, false, false, false, false, false};

        List<ClaimAssessment> assessments = assessmentRepository.findAll(Sort.by(Sort.Direction.DESC, "assessmentDate"));

        if (currentUser != null && currentUser.getRole() == Role.CLAIM_OFFICER) {
            assessments = assessments.stream()
                    .filter(a -> a.getOfficer() != null && a.getOfficer().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }
        if (startDate != null) {
            assessments = assessments.stream()
                    .filter(a -> a.getAssessmentDate() != null && !a.getAssessmentDate().isBefore(startDate))
                    .collect(Collectors.toList());
        }
        if (endDate != null) {
            assessments = assessments.stream()
                    .filter(a -> a.getAssessmentDate() != null && !a.getAssessmentDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            assessments = assessments.stream()
                    .filter(a -> a.getRecommendation() != null && a.getRecommendation().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        if (customerId != null) {
            assessments = assessments.stream()
                    .filter(a -> a.getClaim() != null && a.getClaim().getCustomer() != null && a.getClaim().getCustomer().getId().equals(customerId))
                    .collect(Collectors.toList());
        }

        List<List<Object>> rows = new ArrayList<>();
        for (ClaimAssessment a : assessments) {
            rows.add(Arrays.asList(
                    a.getId() != null ? a.getId().toString() : "",
                    a.getClaim() != null ? a.getClaim().getClaimNumber() : "N/A",
                    a.getClaim() != null && a.getClaim().getCustomer() != null ? a.getClaim().getCustomer().getFullName() : "N/A",
                    a.getClaim() != null && a.getClaim().getPolicy() != null ? a.getClaim().getPolicy().getPolicyNumber() : "N/A",
                    a.getOfficer() != null ? a.getOfficer().getFullName() : "Unassigned",
                    a.getAssessmentDate() != null ? a.getAssessmentDate().toString() : "",
                    a.getAssessedLoss() != null ? a.getAssessedLoss() : BigDecimal.ZERO,
                    a.getEligibleAmount() != null ? a.getEligibleAmount() : BigDecimal.ZERO,
                    a.getNonEligibleAmount() != null ? a.getNonEligibleAmount() : BigDecimal.ZERO,
                    a.getRecommendation() != null ? a.getRecommendation() : "",
                    a.getRemarks() != null ? a.getRemarks() : ""
            ));
        }

        return new ReportData("Claim Assessments Audit Report", "Assessments", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 4. Settlements & Disbursements Report
    private ReportData buildSettlementsReport(UserPrincipal currentUser, String status,
                                              LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Settlement ID", "Claim Number", "Customer Name", "Policy Number", "Approved Amount",
                "Settlement Amount", "Settlement Reference", "Settlement Date", "Status", "Remarks"
        };
        boolean[] isCurrency = {false, false, false, false, true, true, false, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, false, true, false, false};

        List<Settlement> settlements = settlementRepository.findAll(Sort.by(Sort.Direction.DESC, "settlementDate"));

        if (currentUser != null && currentUser.getRole() == Role.CLAIM_OFFICER) {
            settlements = settlements.stream()
                    .filter(s -> s.getClaim() != null && s.getClaim().getAssignedOfficer() != null &&
                            s.getClaim().getAssignedOfficer().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }
        if (startDate != null) {
            settlements = settlements.stream()
                    .filter(s -> s.getSettlementDate() != null && !s.getSettlementDate().isBefore(startDate))
                    .collect(Collectors.toList());
        }
        if (endDate != null) {
            settlements = settlements.stream()
                    .filter(s -> s.getSettlementDate() != null && !s.getSettlementDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            settlements = settlements.stream()
                    .filter(s -> s.getStatus() != null && s.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        if (customerId != null) {
            settlements = settlements.stream()
                    .filter(s -> s.getClaim() != null && s.getClaim().getCustomer() != null && s.getClaim().getCustomer().getId().equals(customerId))
                    .collect(Collectors.toList());
        }

        List<List<Object>> rows = new ArrayList<>();
        for (Settlement s : settlements) {
            rows.add(Arrays.asList(
                    s.getId() != null ? s.getId().toString() : "",
                    s.getClaim() != null ? s.getClaim().getClaimNumber() : "N/A",
                    s.getClaim() != null && s.getClaim().getCustomer() != null ? s.getClaim().getCustomer().getFullName() : "N/A",
                    s.getClaim() != null && s.getClaim().getPolicy() != null ? s.getClaim().getPolicy().getPolicyNumber() : "N/A",
                    s.getApprovedAmount() != null ? s.getApprovedAmount() : BigDecimal.ZERO,
                    s.getSettlementAmount() != null ? s.getSettlementAmount() : BigDecimal.ZERO,
                    s.getSettlementReference() != null ? s.getSettlementReference() : "",
                    s.getSettlementDate() != null ? s.getSettlementDate().toString() : "",
                    s.getStatus() != null ? s.getStatus() : "",
                    s.getRemarks() != null ? s.getRemarks() : ""
            ));
        }

        return new ReportData("Settlement & Disbursement Register", "Settlements", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 5. Documents Report
    private ReportData buildDocumentsReport(UserPrincipal currentUser, String status,
                                            LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Document ID", "Claim Number", "Customer Name", "Policy Number", "Document Type",
                "File Name", "File Size", "Is Photo", "Review Status", "Uploaded By", "Upload Date", "Remarks"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, false, false, false, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, false, false, false, false, true, false};

        List<ClaimDocument> docs = documentRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadDate"));

        if (currentUser != null && currentUser.getRole() == Role.CLAIM_OFFICER) {
            docs = docs.stream()
                    .filter(d -> d.getClaim() != null && d.getClaim().getAssignedOfficer() != null &&
                            d.getClaim().getAssignedOfficer().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }
        if (startDate != null) {
            docs = docs.stream()
                    .filter(d -> d.getUploadDate() != null && !d.getUploadDate().toLocalDate().isBefore(startDate))
                    .collect(Collectors.toList());
        }
        if (endDate != null) {
            docs = docs.stream()
                    .filter(d -> d.getUploadDate() != null && !d.getUploadDate().toLocalDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            docs = docs.stream()
                    .filter(d -> d.getReviewStatus() != null && d.getReviewStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        if (customerId != null) {
            docs = docs.stream()
                    .filter(d -> d.getClaim() != null && d.getClaim().getCustomer() != null && d.getClaim().getCustomer().getId().equals(customerId))
                    .collect(Collectors.toList());
        }

        List<List<Object>> rows = new ArrayList<>();
        for (ClaimDocument d : docs) {
            String sizeStr = d.getFileSize() != null ? String.format(Locale.US, "%.1f KB", d.getFileSize() / 1024.0) : "N/A";
            rows.add(Arrays.asList(
                    d.getId() != null ? d.getId().toString() : "",
                    d.getClaim() != null ? d.getClaim().getClaimNumber() : "N/A",
                    d.getClaim() != null && d.getClaim().getCustomer() != null ? d.getClaim().getCustomer().getFullName() : "N/A",
                    d.getClaim() != null && d.getClaim().getPolicy() != null ? d.getClaim().getPolicy().getPolicyNumber() : "N/A",
                    d.getDocumentType() != null ? d.getDocumentType() : "",
                    d.getFileName() != null ? d.getFileName() : "",
                    sizeStr,
                    Boolean.TRUE.equals(d.getIsPhoto()) ? "Yes" : "No",
                    d.getReviewStatus() != null ? d.getReviewStatus() : "",
                    d.getUploadedBy() != null ? d.getUploadedBy().getFullName() : "",
                    d.getUploadDate() != null ? d.getUploadDate().toLocalDate().toString() : "",
                    d.getOfficerRemarks() != null ? d.getOfficerRemarks() : ""
            ));
        }

        return new ReportData("Documents & Evidence Register", "Documents", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 6. Officer Throughput & SLA Report
    private ReportData buildOfficersReport(UserPrincipal currentUser, String filterDesc) {
        String[] headers = {
                "Officer ID", "Officer Name", "Email", "Department", "Total Assigned",
                "Under Review", "Doc Required", "Approved", "Settled", "Rejected", "Status"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, false, false, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, false, false, false, false, false};

        List<User> officers = userRepository.findByRole(Role.CLAIM_OFFICER);
        if (currentUser != null && currentUser.getRole() == Role.CLAIM_OFFICER) {
            officers = officers.stream()
                    .filter(u -> u.getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        List<Claim> allClaims = claimRepository.findAll();

        List<List<Object>> rows = new ArrayList<>();
        for (User officer : officers) {
            List<Claim> assigned = allClaims.stream()
                    .filter(c -> c.getAssignedOfficer() != null && c.getAssignedOfficer().getId().equals(officer.getId()))
                    .collect(Collectors.toList());

            long underReview = assigned.stream().filter(c -> "Under Review".equalsIgnoreCase(c.getStatus())).count();
            long docReq = assigned.stream().filter(c -> "Documents Required".equalsIgnoreCase(c.getStatus())).count();
            long approved = assigned.stream().filter(c -> "Approved".equalsIgnoreCase(c.getStatus())).count();
            long settled = assigned.stream().filter(c -> "Settled".equalsIgnoreCase(c.getStatus())).count();
            long rejected = assigned.stream().filter(c -> "Rejected".equalsIgnoreCase(c.getStatus())).count();

            rows.add(Arrays.asList(
                    officer.getId() != null ? officer.getId().toString() : "",
                    officer.getFullName() != null ? officer.getFullName() : "",
                    officer.getEmail() != null ? officer.getEmail() : "",
                    officer.getDepartment() != null ? officer.getDepartment() : "General Claims",
                    assigned.size(),
                    underReview,
                    docReq,
                    approved,
                    settled,
                    rejected,
                    officer.getStatus() != null ? officer.getStatus() : "ACTIVE"
            ));
        }

        return new ReportData("Officer Caseload & Throughput Report", "Officer Performance", headers, rows, isCurrency, isDate, filterDesc);
    }

    // 7. Processing Duration Report
    private ReportData buildDurationReport(UserPrincipal currentUser, String status,
                                           LocalDate startDate, LocalDate endDate, Long customerId, String filterDesc) {
        String[] headers = {
                "Claim Number", "Customer Name", "Policy Number", "Claim Type",
                "Current Status", "Priority", "Submitted On", "Days In Processing", "Assigned Officer"
        };
        boolean[] isCurrency = {false, false, false, false, false, false, false, false, false};
        boolean[] isDate = {false, false, false, false, false, false, true, false, false};

        List<Claim> claims = claimRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        claims = filterClaims(claims, currentUser, status, startDate, endDate, customerId);

        List<List<Object>> rows = new ArrayList<>();
        for (Claim c : claims) {
            long days = (c.getCreatedAt() != null) ? ChronoUnit.DAYS.between(c.getCreatedAt().toLocalDate(), LocalDate.now()) : 0;
            rows.add(Arrays.asList(
                    c.getClaimNumber(),
                    c.getCustomer() != null ? c.getCustomer().getFullName() : "N/A",
                    c.getPolicy() != null ? c.getPolicy().getPolicyNumber() : "N/A",
                    c.getClaimType() != null ? c.getClaimType() : "N/A",
                    c.getStatus() != null ? c.getStatus() : "Pending",
                    c.getPriority() != null ? c.getPriority() : "Medium",
                    c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate().toString() : "",
                    days,
                    c.getAssignedOfficer() != null ? c.getAssignedOfficer().getFullName() : "Unassigned"
            ));
        }

        return new ReportData("Claim Processing Duration & SLA Report", "Duration & SLA", headers, rows, isCurrency, isDate, filterDesc);
    }

    // Common Claims Filter Helper
    private List<Claim> filterClaims(List<Claim> claims, UserPrincipal currentUser, String status,
                                     LocalDate startDate, LocalDate endDate, Long customerId) {
        if (currentUser != null && currentUser.getRole() == Role.CLAIM_OFFICER) {
            claims = claims.stream()
                    .filter(c -> c.getAssignedOfficer() != null && c.getAssignedOfficer().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            claims = claims.stream()
                    .filter(c -> c.getStatus() != null && c.getStatus().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }
        if (startDate != null) {
            claims = claims.stream()
                    .filter(c -> (c.getIncidentDate() != null && !c.getIncidentDate().isBefore(startDate)) ||
                            (c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isBefore(startDate)))
                    .collect(Collectors.toList());
        }
        if (endDate != null) {
            claims = claims.stream()
                    .filter(c -> (c.getIncidentDate() != null && !c.getIncidentDate().isAfter(endDate)) ||
                            (c.getCreatedAt() != null && !c.getCreatedAt().toLocalDate().isAfter(endDate)))
                    .collect(Collectors.toList());
        }
        if (customerId != null) {
            claims = claims.stream()
                    .filter(c -> c.getCustomer() != null && c.getCustomer().getId().equals(customerId))
                    .collect(Collectors.toList());
        }
        return claims;
    }

    // ==========================================
    // Inner Classes
    // ==========================================

    public static class ReportData {
        public final String title;
        public final String sheetName;
        public final String[] headers;
        public final List<List<Object>> rows;
        public final boolean[] currencyColumns;
        public final boolean[] dateColumns;
        public final String filterDescription;

        public ReportData(String title, String sheetName, String[] headers, List<List<Object>> rows,
                          boolean[] currencyColumns, boolean[] dateColumns, String filterDescription) {
            this.title = title;
            this.sheetName = sheetName;
            this.headers = headers;
            this.rows = rows;
            this.currencyColumns = currencyColumns;
            this.dateColumns = dateColumns;
            this.filterDescription = filterDescription;
        }
    }

    private static class PdfPageFooterEvent extends PdfPageEventHelper {
        private final Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.ITALIC, new Color(100, 116, 139));

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            float xLeft = document.left();
            float xRight = document.right();
            float y = document.bottom() - 14;

            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("ClaimDesk Enterprise Insurance Management — Confidential Report", footerFont),
                    xLeft, y, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), footerFont),
                    xRight, y, 0);
        }
    }
}
