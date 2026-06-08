package com.onboarding.system.service;

import com.onboarding.system.dto.CreateUserRequest;
import com.onboarding.system.dto.UpdateUserAccessRequest;
import com.onboarding.system.dto.UpdateProfileRequest;
import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.onboarding.EmployeeLifecycleStatus;
import com.onboarding.system.repository.UserRepository;
import java.util.List;
import java.util.stream.StreamSupport;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeIdGeneratorService employeeIdGeneratorService;
    private final OnboardingLedgerService onboardingLedgerService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmployeeIdGeneratorService employeeIdGeneratorService,
            OnboardingLedgerService onboardingLedgerService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.employeeIdGeneratorService = employeeIdGeneratorService;
        this.onboardingLedgerService = onboardingLedgerService;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Portal user directory: admins and HR see everyone; managers only see their direct reports (employees).
     */
    public List<User> getUsersVisibleTo(Authentication authentication) {
        User current = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
        if (current.getRole() == Role.MANAGER) {
            return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                    .filter(user -> user.getRole() == Role.EMPLOYEE)
                    .filter(user -> user.getReportingManager() != null
                            && user.getReportingManager().getId().equals(current.getId()))
                    .toList();
        }
        return userRepository.findAll();
    }

    public User createUser(CreateUserRequest request) {
        validateNewUser(request);
        User user = new User();
        user.setEmployeeId(employeeIdGeneratorService.generateNextEmployeeId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setContactNumber(request.getContactNumber());
        user.setGender(request.getGender());
        user.setName(resolveDisplayName(request));
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setOrganizationEmail(request.getOrganizationEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDepartment(trimToNull(request.getDepartment()));
        user.setJobTitle(trimToNull(request.getJobTitle()));
        user.setJoiningDate(request.getJoiningDate());
        if (request.getRole() == Role.EMPLOYEE) {
            user.setStatus(EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name());
        } else {
            user.setStatus(normalizeStatus(request.getStatus()));
            if (!EmployeeLifecycleStatus.isLoginAllowed(user.getStatus())
                    && !EmployeeLifecycleStatus.isDeactivated(user.getStatus())) {
                user.setStatus(EmployeeLifecycleStatus.ACTIVE.name());
            }
        }
        User saved = userRepository.save(user);
        if (saved.getRole() == Role.EMPLOYEE
                && EmployeeLifecycleStatus.PENDING_HR_APPROVAL.name().equalsIgnoreCase(saved.getStatus())) {
            onboardingLedgerService.appendTimeline(
                    saved,
                    OnboardingLedgerService.EVENT_ACCOUNT_CREATED,
                    "Employee account created by Admin.",
                    resolveActorFromSecurityContext());
        }
        return saved;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateUserAccess(Long id, UpdateUserAccessRequest request) {
        User user = findById(id);
        user.setRole(request.getRole());
        user.setStatus(normalizeStatus(request.getStatus()));
        return userRepository.save(user);
    }

    public User updateStatus(Long id, String status) {
        User user = findById(id);
        user.setStatus(normalizeStatus(status));
        return userRepository.save(user);
    }

    public User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
        ensureActive(user);
        return user;
    }

    public User updateCurrentUserProfile(Authentication authentication, UpdateProfileRequest request) {
        User user = getCurrentUser(authentication);
        if (userRepository.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return userRepository.save(user);
    }

    private String resolveDisplayName(CreateUserRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            return request.getName();
        }
        return (request.getFirstName() + " " + request.getLastName()).trim();
    }

    private void validateNewUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Personal email already exists");
        }
        if (userRepository.existsByOrganizationEmail(request.getOrganizationEmail())) {
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

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        return status.trim().replace(' ', '_').toUpperCase();
    }

    private void ensureActive(User user) {
        if (!EmployeeLifecycleStatus.isLoginAllowed(user.getStatus())) {
            if (EmployeeLifecycleStatus.isDeactivated(user.getStatus())) {
                throw new IllegalArgumentException("Your account has been deactivated. Please contact administrator.");
            }
            throw new IllegalArgumentException("Your account is not activated yet. Please contact HR.");
        }
    }

    private User resolveActorFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }
}
