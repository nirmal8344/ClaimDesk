package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.security.UserPrincipal;
import com.adz4needz.claimdesk.service.ReportExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportExportService reportExportService;

    public ReportController(ReportExportService reportExportService) {
        this.reportExportService = reportExportService;
    }

    @GetMapping("/export/csv")
    public ResponseEntity<Resource> exportCsv(
            @RequestParam(value = "type", defaultValue = "claims") String reportType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "customerId", required = false) Long customerId,
            @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {

        byte[] bytes = reportExportService.exportCsv(reportType, currentUser, status, startDate, endDate, customerId);
        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(bytes));

        String filename = "claimdesk_" + sanitizeFilename(reportType) + "_" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(resource);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportExcel(
            @RequestParam(value = "type", defaultValue = "claims") String reportType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "customerId", required = false) Long customerId,
            @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {

        ByteArrayInputStream stream = reportExportService.exportExcel(reportType, currentUser, status, startDate, endDate, customerId);
        InputStreamResource resource = new InputStreamResource(stream);

        String filename = "claimdesk_" + sanitizeFilename(reportType) + "_" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<Resource> exportPdf(
            @RequestParam(value = "type", defaultValue = "claims") String reportType,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "customerId", required = false) Long customerId,
            @AuthenticationPrincipal UserPrincipal currentUser) throws IOException {

        ByteArrayInputStream stream = reportExportService.exportPdf(reportType, currentUser, status, startDate, endDate, customerId);
        InputStreamResource resource = new InputStreamResource(stream);

        String filename = "claimdesk_" + sanitizeFilename(reportType) + "_" + LocalDate.now() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    private String sanitizeFilename(String type) {
        if (type == null || type.isBlank()) return "report";
        return type.trim().toLowerCase().replaceAll("[^a-z0-9_-]+", "_");
    }
}
