package com.onboarding.system.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectEmployeeRequest {

    @NotBlank
    private String remarks;

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
