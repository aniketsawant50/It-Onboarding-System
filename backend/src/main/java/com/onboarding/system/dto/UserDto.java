package com.onboarding.system.dto;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDto {

    private Long id;
    private String employeeId;
    private String name;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String gender;
    private String username;
    private String email;
    private String organizationEmail;
    private Role role;
    private String status;
    private String department;
    private String jobTitle;
    private LocalDate joiningDate;
    private Long reportingManagerId;
    private String reportingManagerName;
    private String reportingManagerDepartment;
    private String lastQueryReason;
    private String lastQueryRemarks;
    private LocalDateTime lastQueryAt;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.employeeId = user.getEmployeeId();
        dto.name = user.getName();
        dto.firstName = user.getFirstName();
        dto.lastName = user.getLastName();
        dto.dateOfBirth = user.getDateOfBirth();
        dto.contactNumber = user.getContactNumber();
        dto.gender = user.getGender();
        dto.username = user.getUsername();
        dto.email = user.getEmail();
        dto.organizationEmail = user.getOrganizationEmail();
        dto.role = user.getRole();
        dto.status = user.getStatus();
        dto.department = user.getDepartment();
        dto.jobTitle = user.getJobTitle();
        dto.joiningDate = user.getJoiningDate();
        if (user.getReportingManager() != null) {
            dto.reportingManagerId = user.getReportingManager().getId();
            dto.reportingManagerName = user.getReportingManager().getName();
            dto.reportingManagerDepartment = user.getReportingManager().getDepartment();
        }
        dto.lastQueryReason = user.getLastQueryReason();
        dto.lastQueryRemarks = user.getLastQueryRemarks();
        dto.lastQueryAt = user.getLastQueryAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getName() {
        return name;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public String getGender() {
        return gender;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getOrganizationEmail() {
        return organizationEmail;
    }

    public Role getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public String getDepartment() {
        return department;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public Long getReportingManagerId() {
        return reportingManagerId;
    }

    public String getReportingManagerName() {
        return reportingManagerName;
    }

    public String getReportingManagerDepartment() {
        return reportingManagerDepartment;
    }

    public String getLastQueryReason() {
        return lastQueryReason;
    }

    public String getLastQueryRemarks() {
        return lastQueryRemarks;
    }

    public LocalDateTime getLastQueryAt() {
        return lastQueryAt;
    }
}
