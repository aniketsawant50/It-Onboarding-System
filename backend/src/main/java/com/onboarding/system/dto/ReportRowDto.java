package com.onboarding.system.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ReportRowDto {

    private Map<String, String> data = new LinkedHashMap<>();

    public static ReportRowDto from(Map<String, String> data) {
        ReportRowDto row = new ReportRowDto();
        row.setData(data);
        return row;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }
}
