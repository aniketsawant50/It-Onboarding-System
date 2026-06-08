package com.onboarding.system.controller;

import com.onboarding.system.dto.AdminOnboardingEmployeeUpdateRequest;
import com.onboarding.system.dto.UserDto;
import com.onboarding.system.service.HrOnboardingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/onboarding")
public class AdminOnboardingController {

    private final HrOnboardingService hrOnboardingService;

    public AdminOnboardingController(HrOnboardingService hrOnboardingService) {
        this.hrOnboardingService = hrOnboardingService;
    }

    @GetMapping("/hr-queries")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> listHrQueries() {
        return hrOnboardingService.listHrQueriesForAdmin();
    }

    @PutMapping("/employees/{id}/query-update")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto updateEmployeeForQuery(@PathVariable Long id, @Valid @RequestBody AdminOnboardingEmployeeUpdateRequest request) {
        return hrOnboardingService.adminUpdateEmployeeForQuery(id, request);
    }

    @PostMapping("/employees/{id}/resubmit-to-hr")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto resubmitToHr(Authentication authentication, @PathVariable Long id) {
        return hrOnboardingService.adminResubmitToHr(authentication, id);
    }
}
