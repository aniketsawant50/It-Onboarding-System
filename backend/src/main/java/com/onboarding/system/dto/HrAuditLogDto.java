package com.onboarding.system.dto;

import com.onboarding.system.entity.HrAuditLog;
import java.time.LocalDateTime;

public class HrAuditLogDto {

    private Long id;
    private String action;
    private String performedByName;
    private String remarks;
    private LocalDateTime createdAt;

    public static HrAuditLogDto fromEntity(HrAuditLog log) {
        HrAuditLogDto dto = new HrAuditLogDto();
        dto.id = log.getId();
        dto.action = log.getAction();
        dto.performedByName = log.getPerformedBy() != null ? log.getPerformedBy().getName() : null;
        dto.remarks = log.getRemarks();
        dto.createdAt = log.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public String getRemarks() {
        return remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
