package com.onboarding.system.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReportResponse {

    private String reportName;
    private ReportType reportType;
    private LocalDateTime generatedAt;
    private List<String> columns = new ArrayList<>();
    private List<ReportRowDto> rows = new ArrayList<>();
    private int totalRecords;

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public List<String> getColumns() {
        return columns;
    }

    public void setColumns(List<String> columns) {
        this.columns = columns;
    }

    public List<ReportRowDto> getRows() {
        return rows;
    }

    public void setRows(List<ReportRowDto> rows) {
        this.rows = rows;
    }

    public int getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(int totalRecords) {
        this.totalRecords = totalRecords;
    }
}
