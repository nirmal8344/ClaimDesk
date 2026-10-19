package com.adz4needz.claimdesk.controller;

import com.adz4needz.claimdesk.service.ReportExportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportExportService reportExportService;

    public ReportController(ReportExportService reportExportService) {
        this.reportExportService = reportExportService;
    }

    @GetMapping("/export/csv")
    public ResponseEntity<Resource> exportCsv(@RequestParam(value = "type", defaultValue = "claims") String reportType) throws IOException {
        String csvContent = reportExportService.exportCsv(reportType);
        byte[] bytes = csvContent.getBytes();
        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(bytes));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"claimdesk_" + reportType.replaceAll("\\s+", "_") + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportExcel(@RequestParam(value = "type", defaultValue = "claims") String reportType) throws IOException {
        ByteArrayInputStream stream = reportExportService.exportExcel(reportType);
        InputStreamResource resource = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"claimdesk_" + reportType.replaceAll("\\s+", "_") + ".xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }
}
