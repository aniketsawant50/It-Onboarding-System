package com.onboarding.system.controller;

import com.onboarding.system.dto.AssignReportingManagerRequest;
import com.onboarding.system.dto.HrAssetRejectRequest;
import com.onboarding.system.dto.HrAuditLogDto;
import com.onboarding.system.dto.HrOnboardingDashboardDto;
import com.onboarding.system.dto.OnboardingTimelineEventDto;
import com.onboarding.system.dto.QueryToAdminRequest;
import com.onboarding.system.dto.RejectEmployeeRequest;
import com.onboarding.system.dto.UserDto;
import com.onboarding.system.entity.Asset;
import com.onboarding.system.service.HrOnboardingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/onboarding")
public class HrOnboardingController {

    private final HrOnboardingService hrOnboardingService;

    public HrOnboardingController(HrOnboardingService hrOnboardingService) {
        this.hrOnboardingService = hrOnboardingService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('HR')")
    public HrOnboardingDashboardDto dashboard() {
        return hrOnboardingService.getDashboardStats();
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('HR')")
    public List<UserDto> listEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) Long managerId) {
        return hrOnboardingService.listEmployees(search, status, department, jobTitle, managerId);
    }

    @GetMapping("/employees/{id}")
    @PreAuthorize("hasRole('HR')")
    public UserDto getEmployee(@PathVariable Long id) {
        return hrOnboardingService.getEmployee(id);
    }

    @GetMapping("/employees/{id}/timeline")
    @PreAuthorize("hasRole('HR')")
    public List<OnboardingTimelineEventDto> timeline(@PathVariable Long id) {
        return hrOnboardingService.getTimeline(id);
    }

    @GetMapping("/employees/{id}/audit")
    @PreAuthorize("hasRole('HR')")
    public List<HrAuditLogDto> audit(@PathVariable Long id) {
        return hrOnboardingService.getAudit(id);
    }

    @PostMapping("/employees/{id}/start-review")
    @PreAuthorize("hasRole('HR')")
    public UserDto startReview(Authentication authentication, @PathVariable Long id) {
        return hrOnboardingService.startHrReview(authentication, id);
    }

    @PostMapping("/employees/{id}/approve-verification")
    @PreAuthorize("hasRole('HR')")
    public UserDto approveVerification(Authentication authentication, @PathVariable Long id) {
        return hrOnboardingService.approveVerification(authentication, id);
    }

    @PostMapping("/employees/{id}/verify")
    @PreAuthorize("hasRole('HR')")
    public UserDto verify(Authentication authentication, @PathVariable Long id) {
        return hrOnboardingService.verifyEmployee(authentication, id);
    }

    @PostMapping("/employees/{id}/reject")
    @PreAuthorize("hasRole('HR')")
    public UserDto reject(
            Authentication authentication, @PathVariable Long id, @Valid @RequestBody RejectEmployeeRequest request) {
        return hrOnboardingService.rejectEmployee(authentication, id, request);
    }

    @PostMapping("/employees/{id}/query-to-admin")
    @PreAuthorize("hasRole('HR')")
    public UserDto queryToAdmin(
            Authentication authentication, @PathVariable Long id, @Valid @RequestBody QueryToAdminRequest request) {
        return hrOnboardingService.queryToAdmin(authentication, id, request);
    }

    @PostMapping("/employees/{id}/assign-manager")
    @PreAuthorize("hasRole('HR')")
    public UserDto assignManager(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AssignReportingManagerRequest request) {
        return hrOnboardingService.assignReportingManager(authentication, id, request);
    }

    @PostMapping("/employees/{id}/activate")
    @PreAuthorize("hasRole('HR')")
    public UserDto activate(Authentication authentication, @PathVariable Long id) {
        return hrOnboardingService.activateEmployee(authentication, id);
    }

    @PostMapping("/employees/{employeeId}/assets/{assetId}/approve")
    @PreAuthorize("hasRole('HR')")
    public Asset approveAsset(Authentication authentication, @PathVariable Long employeeId, @PathVariable Long assetId) {
        return hrOnboardingService.hrApproveAsset(authentication, employeeId, assetId);
    }

    @PostMapping("/employees/{employeeId}/assets/{assetId}/reject")
    @PreAuthorize("hasRole('HR')")
    public Asset rejectAsset(
            Authentication authentication,
            @PathVariable Long employeeId,
            @PathVariable Long assetId,
            @RequestBody(required = false) HrAssetRejectRequest request) {
        return hrOnboardingService.hrRejectAsset(authentication, employeeId, assetId, request);
    }
}
