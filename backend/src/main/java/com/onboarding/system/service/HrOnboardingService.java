package com.onboarding.system.service;

import com.onboarding.system.dto.AdminOnboardingEmployeeUpdateRequest;
import com.onboarding.system.dto.AssignReportingManagerRequest;
import com.onboarding.system.dto.HrAssetRejectRequest;
import com.onboarding.system.dto.HrAuditLogDto;
import com.onboarding.system.dto.HrOnboardingDashboardDto;
import com.onboarding.system.dto.OnboardingTimelineEventDto;
import com.onboarding.system.dto.QueryToAdminRequest;
import com.onboarding.system.dto.RejectEmployeeRequest;
import com.onboarding.system.dto.UserDto;
import com.onboarding.system.entity.Asset;
import com.onboarding.system.entity.AssetAssignmentHistory;
import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.onboarding.EmployeeLifecycleStatus;
import com.onboarding.system.repository.AssetAssignmentHistoryRepository;
import com.onboarding.system.repository.AssetRepository;
import com.onboarding.system.repository.HrAuditLogRepository;
import com.onboarding.system.repository.OnboardingTimelineEventRepository;
import com.onboarding.system.repository.UserRepository;
import com.onboarding.system.repository.UserSpecifications;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class HrOnboardingService {

    public static final String ASSET_PENDING_APPROVAL = "PENDING_APPROVAL";
    public static final String ASSET_APPROVED = "APPROVED";
    public static final String ASSET_REJECTED = "REJECTED";

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final OnboardingLedgerService onboardingLedgerService;
    private final OnboardingTimelineEventRepository timelineEventRepository;
    private final HrAuditLogRepository hrAuditLogRepository;
    private final AssetAssignmentHistoryRepository assetAssignmentHistoryRepository;

    public HrOnboardingService(
            UserRepository userRepository,
            AssetRepository assetRepository,
            OnboardingLedgerService onboardingLedgerService,
            OnboardingTimelineEventRepository timelineEventRepository,
            HrAuditLogRepository hrAuditLogRepository,
            AssetAssignmentHistoryRepository assetAssignmentHistoryRepository) {
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.onboardingLedgerService = onboardingLedgerService;
        this.timelineEventRepository = timelineEventRepository;
        this.hrAuditLogRepository = hrAuditLogRepository;
        this.assetAssignmentHistoryRepository = assetAssignmentHistoryRepository;
    }

    @Transactional(readOnly = true)
    public HrOnboardingDashboardDto getDashboardStats() {
        HrOnboardingDashboardDto dto = new HrOnboardingDashboardDto();
        dto.setPendingEmployeeApprovals(
                userRepository.countByRoleAndStatus(Role.EMPLOYEE, EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name()));
        dto.setPendingAssetApprovals(assetRepository.countEmployeeAssetsPendingHrApproval());
        dto.setActiveEmployees(userRepository.countByRoleAndStatus(Role.EMPLOYEE, EmployeeLifecycleStatus.ACTIVE.name()));
        dto.setInactiveEmployees(userRepository.countByRoleAndStatus(Role.EMPLOYEE, EmployeeLifecycleStatus.INACTIVE.name()));
        dto.setEmployeesWithManagerAssigned(userRepository.countByRoleAndReportingManagerIsNotNull(Role.EMPLOYEE));
        dto.setQueryToAdminCount(
                userRepository.countByRoleAndStatus(Role.EMPLOYEE, EmployeeLifecycleStatus.QUERY_TO_ADMIN.name()));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listEmployees(
            String search,
            String status,
            String department,
            String jobTitle,
            Long managerId) {
        Specification<User> spec = Specification.where(UserSpecifications.roleEquals(Role.EMPLOYEE));
        if (StringUtils.hasText(search)) {
            spec = spec.and(UserSpecifications.nameOrEmailContains(search));
        }
        spec = spec.and(UserSpecifications.statusEqualsIgnoreCase(status));
        spec = spec.and(UserSpecifications.departmentContains(department));
        spec = spec.and(UserSpecifications.jobTitleContains(jobTitle));
        spec = spec.and(UserSpecifications.reportingManagerIdEquals(managerId));
        return userRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserDto getEmployee(Long id) {
        return UserDto.fromEntity(loadEmployee(id));
    }

    @Transactional(readOnly = true)
    public List<OnboardingTimelineEventDto> getTimeline(Long employeeId) {
        User employee = loadEmployee(employeeId);
        return timelineEventRepository.findByEmployeeOrderByCreatedAtAsc(employee).stream()
                .map(OnboardingTimelineEventDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HrAuditLogDto> getAudit(Long employeeId) {
        User employee = loadEmployee(employeeId);
        return hrAuditLogRepository.findByEmployeeOrderByCreatedAtDesc(employee).stream()
                .map(HrAuditLogDto::fromEntity)
                .toList();
    }

    @Transactional
    public UserDto startHrReview(Authentication authentication, Long employeeId) {
        return transitionPendingToHrReview(authentication, employeeId, "START_HR_REVIEW");
    }

    @Transactional
    public UserDto approveVerification(Authentication authentication, Long employeeId) {
        return transitionPendingToHrReview(authentication, employeeId, "APPROVE_VERIFICATION");
    }

    private UserDto transitionPendingToHrReview(Authentication authentication, Long employeeId, String auditAction) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("This action is only available while status is PENDING_HR_APPROVAL.");
        }
        employee.setStatus(EmployeeLifecycleStatus.HR_REVIEW.name());
        User saved = userRepository.save(employee);
        String details =
                "HR moved the employee from PENDING_HR_APPROVAL to HR_REVIEW (verification in progress). Activate separately once a reporting manager is assigned.";
        onboardingLedgerService.appendTimeline(saved, OnboardingLedgerService.EVENT_HR_REVIEW_STARTED, details, hr);
        onboardingLedgerService.appendHrAudit(saved, auditAction, hr, details);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto verifyEmployee(Authentication authentication, Long employeeId) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.HR_REVIEW.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Verify is only available while status is HR_REVIEW.");
        }
        onboardingLedgerService.appendTimeline(
                employee, "HR_VERIFICATION_NOTE", "HR completed verification checklist (no status change).", hr);
        onboardingLedgerService.appendHrAudit(employee, "VERIFY_EMPLOYEE", hr, "HR verified employee onboarding details.");
        return UserDto.fromEntity(employee);
    }

    @Transactional
    public UserDto rejectEmployee(Authentication authentication, Long employeeId, RejectEmployeeRequest request) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name().equalsIgnoreCase(employee.getStatus())
                && !EmployeeLifecycleStatus.HR_REVIEW.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Reject is only available while status is PENDING_HR_APPROVAL or HR_REVIEW.");
        }
        employee.setStatus(EmployeeLifecycleStatus.REJECTED.name());
        User saved = userRepository.save(employee);
        onboardingLedgerService.appendTimeline(
                saved, OnboardingLedgerService.EVENT_REJECTED, "Rejected by HR. Remarks: " + request.getRemarks(), hr);
        onboardingLedgerService.appendHrAudit(saved, "REJECT_EMPLOYEE", hr, request.getRemarks());
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto queryToAdmin(Authentication authentication, Long employeeId, QueryToAdminRequest request) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name().equalsIgnoreCase(employee.getStatus())
                && !EmployeeLifecycleStatus.HR_REVIEW.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Query to Admin is only available while status is PENDING_HR_APPROVAL or HR_REVIEW.");
        }
        employee.setStatus(EmployeeLifecycleStatus.QUERY_TO_ADMIN.name());
        employee.setLastQueryReason(request.getReason().name());
        employee.setLastQueryRemarks(request.getRemarks());
        employee.setLastQueryAt(LocalDateTime.now());
        User saved = userRepository.save(employee);
        String details = "Reason: " + request.getReason() + ". Remarks: " + request.getRemarks();
        onboardingLedgerService.appendTimeline(saved, OnboardingLedgerService.EVENT_QUERY_TO_ADMIN, details, hr);
        onboardingLedgerService.appendHrAudit(saved, "QUERY_TO_ADMIN", hr, request.getRemarks());
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto assignReportingManager(Authentication authentication, Long employeeId, AssignReportingManagerRequest request) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (EmployeeLifecycleStatus.QUERY_TO_ADMIN.name().equalsIgnoreCase(employee.getStatus())
                || EmployeeLifecycleStatus.REJECTED.name().equalsIgnoreCase(employee.getStatus())
                || EmployeeLifecycleStatus.INACTIVE.name().equalsIgnoreCase(employee.getStatus())
                || EmployeeLifecycleStatus.ACTIVE.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Reporting manager cannot be assigned for the current employee status.");
        }
        User manager = userRepository.findById(request.getManagerUserId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        if (manager.getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Selected user is not a manager.");
        }
        if (!EmployeeLifecycleStatus.isLoginAllowed(manager.getStatus())) {
            throw new IllegalArgumentException("Selected manager account is not active.");
        }
        employee.setReportingManager(manager);
        User saved = userRepository.save(employee);
        String dept = StringUtils.hasText(manager.getDepartment()) ? manager.getDepartment() : "N/A";
        String details = "Reporting manager set to " + manager.getName() + " (" + dept + ").";
        onboardingLedgerService.appendTimeline(saved, OnboardingLedgerService.EVENT_MANAGER_ASSIGNED, details, hr);
        onboardingLedgerService.appendHrAudit(saved, "ASSIGN_MANAGER", hr, details);
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto activateEmployee(Authentication authentication, Long employeeId) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.HR_REVIEW.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Only HR can activate employees, and only from HR_REVIEW status.");
        }
        if (employee.getReportingManager() == null) {
            throw new IllegalArgumentException("Assign a reporting manager before activation.");
        }
        employee.setStatus(EmployeeLifecycleStatus.ACTIVE.name());
        User saved = userRepository.save(employee);
        onboardingLedgerService.appendTimeline(saved, OnboardingLedgerService.EVENT_ACTIVATED, "Employee activated by HR.", hr);
        onboardingLedgerService.appendHrAudit(saved, "ACTIVATE_EMPLOYEE", hr, "Employee activated by HR.");
        return UserDto.fromEntity(saved);
    }

    @Transactional
    public Asset hrApproveAsset(Authentication authentication, Long employeeId, Long assetId) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        Asset asset = loadEmployeeAsset(employee, assetId);
        assertPendingAsset(asset);
        String previous = asset.getStatus();
        asset.setStatus(ASSET_APPROVED);
        Asset saved = assetRepository.save(asset);
        recordAssetHistory(saved, previous, ASSET_APPROVED, hr);
        onboardingLedgerService.appendTimeline(
                employee,
                OnboardingLedgerService.EVENT_ASSET_APPROVED,
                "Asset \"" + saved.getName() + "\" approved by HR.",
                hr);
        onboardingLedgerService.appendHrAudit(employee, "ASSET_APPROVED", hr, "Asset id " + saved.getId());
        return saved;
    }

    @Transactional
    public Asset hrRejectAsset(Authentication authentication, Long employeeId, Long assetId, HrAssetRejectRequest request) {
        User hr = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        Asset asset = loadEmployeeAsset(employee, assetId);
        assertPendingAsset(asset);
        String previous = asset.getStatus();
        asset.setStatus(ASSET_REJECTED);
        Asset saved = assetRepository.save(asset);
        recordAssetHistory(saved, previous, ASSET_REJECTED, hr);
        String remarks = request != null && StringUtils.hasText(request.getRemarks())
                ? request.getRemarks().trim()
                : "";
        onboardingLedgerService.appendTimeline(
                employee,
                OnboardingLedgerService.EVENT_ASSET_REJECTED,
                "Asset \"" + saved.getName() + "\" rejected by HR." + (remarks.isEmpty() ? "" : " Remarks: " + remarks),
                hr);
        onboardingLedgerService.appendHrAudit(employee, "ASSET_REJECTED", hr, remarks.isEmpty() ? "Asset rejected." : remarks);
        return saved;
    }

    private Asset loadEmployeeAsset(User employee, Long assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new IllegalArgumentException("Asset not found"));
        if (asset.getAssignedTo() == null || !asset.getAssignedTo().getId().equals(employee.getId())) {
            throw new IllegalArgumentException("Asset is not assigned to this employee.");
        }
        return asset;
    }

    private void assertPendingAsset(Asset asset) {
        String st = asset.getStatus();
        if (st == null) {
            throw new IllegalArgumentException("Asset is not awaiting HR approval.");
        }
        if (!ASSET_PENDING_APPROVAL.equalsIgnoreCase(st) && !"PENDING".equalsIgnoreCase(st)) {
            throw new IllegalArgumentException("Asset is not awaiting HR approval.");
        }
    }

    private void recordAssetHistory(Asset asset, String previousStatus, String newStatus, User hr) {
        AssetAssignmentHistory history = new AssetAssignmentHistory(
                asset,
                asset.getAssignedTo(),
                previousStatus,
                newStatus,
                "HR",
                "HR onboarding approval decision (" + hr.getUsername() + ")");
        history.setAssignmentDate(LocalDateTime.now());
        history.setAssignedDate(LocalDateTime.now());
        assetAssignmentHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public List<UserDto> listHrQueriesForAdmin() {
        Specification<User> spec = Specification.where(UserSpecifications.roleEquals(Role.EMPLOYEE))
                .and(UserSpecifications.statusEqualsIgnoreCase(EmployeeLifecycleStatus.QUERY_TO_ADMIN.name()));
        return userRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "lastQueryAt")).stream()
                .map(UserDto::fromEntity)
                .toList();
    }

    @Transactional
    public UserDto adminUpdateEmployeeForQuery(Long employeeId, AdminOnboardingEmployeeUpdateRequest request) {
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.QUERY_TO_ADMIN.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Employee is not awaiting an admin fix.");
        }
        if (request.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Only EMPLOYEE role is supported for this update.");
        }
        validateUniqueEmails(employee.getId(), request.getEmail(), request.getOrganizationEmail());
        employee.setFirstName(request.getFirstName().trim());
        employee.setLastName(request.getLastName().trim());
        employee.setName((request.getFirstName().trim() + " " + request.getLastName().trim()).trim());
        employee.setEmail(request.getEmail().trim());
        employee.setOrganizationEmail(request.getOrganizationEmail().trim());
        employee.setDepartment(trimToNull(request.getDepartment()));
        employee.setJobTitle(trimToNull(request.getJobTitle()));
        employee.setJoiningDate(request.getJoiningDate());
        employee.setRole(request.getRole());
        return UserDto.fromEntity(userRepository.save(employee));
    }

    @Transactional
    public UserDto adminResubmitToHr(Authentication authentication, Long employeeId) {
        User admin = resolveActor(authentication);
        User employee = loadEmployee(employeeId);
        assertEmployee(employee);
        if (!EmployeeLifecycleStatus.QUERY_TO_ADMIN.name().equalsIgnoreCase(employee.getStatus())) {
            throw new IllegalArgumentException("Only employees in QUERY_TO_ADMIN can be resubmitted.");
        }
        employee.setStatus(EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name());
        employee.setLastQueryAt(null);
        User saved = userRepository.save(employee);
        onboardingLedgerService.appendTimeline(
                saved,
                OnboardingLedgerService.EVENT_RESUBMITTED_TO_HR,
                "Admin resubmitted the employee record to HR for re-review.",
                admin);
        onboardingLedgerService.appendHrAudit(saved, "ADMIN_RESUBMIT_TO_HR", admin, "Resubmitted after admin corrections.");
        return UserDto.fromEntity(saved);
    }

    private void validateUniqueEmails(Long employeeId, String email, String organizationEmail) {
        if (userRepository.existsByEmailAndIdNot(email, employeeId)) {
            throw new IllegalArgumentException("Personal email already exists");
        }
        if (userRepository.existsByOrganizationEmailAndIdNot(organizationEmail, employeeId)) {
            throw new IllegalArgumentException("Organization email already exists");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private User resolveActor(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    private User loadEmployee(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Target user is not an employee.");
        }
        return user;
    }

    private void assertEmployee(User employee) {
        if (employee.getRole() != Role.EMPLOYEE) {
            throw new IllegalArgumentException("Target user is not an employee.");
        }
    }
}
