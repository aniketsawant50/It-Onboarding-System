package com.onboarding.system.dto;

import com.onboarding.system.onboarding.QueryToAdminReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QueryToAdminRequest {

    @NotBlank
    private String remarks;

    @NotNull
    private QueryToAdminReason reason;

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public QueryToAdminReason getReason() {
        return reason;
    }

    public void setReason(QueryToAdminReason reason) {
        this.reason = reason;
    }
}
