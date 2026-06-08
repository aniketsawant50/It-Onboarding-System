package com.onboarding.system.dto;

import jakarta.validation.constraints.NotNull;

public class AssignReportingManagerRequest {

    @NotNull
    private Long managerUserId;

    public Long getManagerUserId() {
        return managerUserId;
    }

    public void setManagerUserId(Long managerUserId) {
        this.managerUserId = managerUserId;
    }
}
