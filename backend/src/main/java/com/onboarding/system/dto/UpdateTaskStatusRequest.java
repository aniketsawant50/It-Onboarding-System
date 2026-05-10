package com.onboarding.system.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class UpdateTaskStatusRequest {

    @NotBlank
    private String status;

    private LocalDate completionDate;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }
}
