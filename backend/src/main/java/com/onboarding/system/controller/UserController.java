package com.onboarding.system.controller;

import com.onboarding.system.dto.CreateUserRequest;
import com.onboarding.system.dto.UpdateUserStatusRequest;
import com.onboarding.system.dto.UpdateUserAccessRequest;
import com.onboarding.system.dto.UpdateProfileRequest;
import com.onboarding.system.dto.UserDto;
import com.onboarding.system.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<UserDto> getUsers() {
        return userService.getAllUsers().stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public UserDto getCurrentUser(Authentication authentication) {
        return UserDto.fromEntity(userService.getCurrentUser(authentication));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto createUser(@Valid @RequestBody CreateUserRequest request) {
        return UserDto.fromEntity(userService.createUser(request));
    }

    @PutMapping("/{id}/access")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateUserAccess(@PathVariable Long id, @Valid @RequestBody UpdateUserAccessRequest request) {
        return UserDto.fromEntity(userService.updateUserAccess(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public UserDto updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        return UserDto.fromEntity(userService.updateStatus(id, request.getStatus()));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public UserDto updateCurrentUserProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return UserDto.fromEntity(userService.updateCurrentUserProfile(authentication, request));
    }
}
