package com.onboarding.system.dto;

public class HrOnboardingDashboardDto {

    private long pendingEmployeeApprovals;
    private long pendingAssetApprovals;
    private long activeEmployees;
    private long inactiveEmployees;
    private long employeesWithManagerAssigned;
    private long queryToAdminCount;

    public long getPendingEmployeeApprovals() {
        return pendingEmployeeApprovals;
    }

    public void setPendingEmployeeApprovals(long pendingEmployeeApprovals) {
        this.pendingEmployeeApprovals = pendingEmployeeApprovals;
    }

    public long getPendingAssetApprovals() {
        return pendingAssetApprovals;
    }

    public void setPendingAssetApprovals(long pendingAssetApprovals) {
        this.pendingAssetApprovals = pendingAssetApprovals;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getInactiveEmployees() {
        return inactiveEmployees;
    }

    public void setInactiveEmployees(long inactiveEmployees) {
        this.inactiveEmployees = inactiveEmployees;
    }

    public long getEmployeesWithManagerAssigned() {
        return employeesWithManagerAssigned;
    }

    public void setEmployeesWithManagerAssigned(long employeesWithManagerAssigned) {
        this.employeesWithManagerAssigned = employeesWithManagerAssigned;
    }

    public long getQueryToAdminCount() {
        return queryToAdminCount;
    }

    public void setQueryToAdminCount(long queryToAdminCount) {
        this.queryToAdminCount = queryToAdminCount;
    }
}
