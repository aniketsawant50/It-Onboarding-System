package com.onboarding.system.controller;

import com.onboarding.system.dto.ReportRequest;
import com.onboarding.system.dto.ReportResponse;
import com.onboarding.system.service.PdfReportService;
import com.onboarding.system.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final PdfReportService pdfReportService;

    public ReportController(ReportService reportService, PdfReportService pdfReportService) {
        this.reportService = reportService;
        this.pdfReportService = pdfReportService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ReportResponse generateReport(@Valid @RequestBody ReportRequest request, Authentication authentication) {
        return reportService.generateReport(request, authentication);
    }

    @PostMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<byte[]> downloadReport(@Valid @RequestBody ReportRequest request, Authentication authentication) {
        ReportResponse report = reportService.generateReport(request, authentication);
        byte[] pdfBytes = pdfReportService.buildPdf(report);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""
                        + report.getReportType().name().toLowerCase() + "-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
