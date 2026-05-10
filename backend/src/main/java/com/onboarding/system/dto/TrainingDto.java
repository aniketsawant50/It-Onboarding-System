package com.onboarding.system.dto;

import com.onboarding.system.entity.Training;
import java.time.LocalDateTime;

public class TrainingDto {

    private Long id;
    private String title;
    private String description;
    private Boolean completionStatus;
    private LocalDateTime completedDate;
    private Long employeeId;
    private String employeeName;

    public static TrainingDto fromEntity(Training training) {
        TrainingDto dto = new TrainingDto();
        dto.id = training.getId();
        dto.title = training.getTitle();
        dto.description = training.getDescription();
        dto.completionStatus = training.getCompletionStatus() != null && training.getCompletionStatus();
        dto.completedDate = training.getCompletedDate();
        dto.employeeId = training.getEmployee() != null ? training.getEmployee().getId() : null;
        dto.employeeName = training.getEmployee() != null ? training.getEmployee().getName() : null;
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getCompletionStatus() {
        return completionStatus;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }
}
