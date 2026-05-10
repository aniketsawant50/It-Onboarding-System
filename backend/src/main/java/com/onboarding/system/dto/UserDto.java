package com.onboarding.system.dto;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import java.time.LocalDate;

public class UserDto {

    private Long id;
    private String name;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String gender;
    private String username;
    private String email;
    private Role role;
    private String status;

    public static UserDto fromEntity(User user) {
        UserDto dto = new UserDto();
        dto.id = user.getId();
        dto.name = user.getName();
        dto.firstName = user.getFirstName();
        dto.lastName = user.getLastName();
        dto.dateOfBirth = user.getDateOfBirth();
        dto.contactNumber = user.getContactNumber();
        dto.gender = user.getGender();
        dto.username = user.getUsername();
        dto.email = user.getEmail();
        dto.role = user.getRole();
        dto.status = user.getStatus();
        return dto;
    }

    public Long getId() {
        return id;
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

    public Role getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}
