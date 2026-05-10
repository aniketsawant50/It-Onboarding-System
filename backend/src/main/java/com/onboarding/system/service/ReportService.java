package com.onboarding.system.service;

import com.onboarding.system.dto.ReportRequest;
import com.onboarding.system.dto.ReportResponse;
import com.onboarding.system.dto.ReportRowDto;
import com.onboarding.system.dto.ReportType;
import com.onboarding.system.entity.Asset;
import com.onboarding.system.entity.AssetAssignmentHistory;
import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.Task;
import com.onboarding.system.entity.TaskAssignmentHistory;
import com.onboarding.system.entity.Training;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.AssetAssignmentHistoryRepository;
import com.onboarding.system.repository.AssetRepository;
import com.onboarding.system.repository.TaskAssignmentHistoryRepository;
import com.onboarding.system.repository.TaskRepository;
import com.onboarding.system.repository.TrainingRepository;
import com.onboarding.system.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AssetRepository assetRepository;
    private final TrainingRepository trainingRepository;
    private final TaskAssignmentHistoryRepository taskHistoryRepository;
    private final AssetAssignmentHistoryRepository assetHistoryRepository;
    private final UserService userService;

    public ReportService(
            UserRepository userRepository,
            TaskRepository taskRepository,
            AssetRepository assetRepository,
            TrainingRepository trainingRepository,
            TaskAssignmentHistoryRepository taskHistoryRepository,
            AssetAssignmentHistoryRepository assetHistoryRepository,
            UserService userService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.assetRepository = assetRepository;
        this.trainingRepository = trainingRepository;
        this.taskHistoryRepository = taskHistoryRepository;
        this.assetHistoryRepository = assetHistoryRepository;
        this.userService = userService;
    }

    public ReportResponse generateReport(ReportRequest request, Authentication authentication) {
        validateDateRange(request);

        User currentUser = userService.getCurrentUser(authentication);
        ensureReportTypeAllowed(currentUser.getRole(), request.getReportType());

        return switch (request.getReportType()) {
            case ALL_EMPLOYEES, ONBOARDING_STATUS, EMPLOYEE_ONBOARDING, NEW_JOINERS, PENDING_ONBOARDING ->
                    buildUserReport(request, currentUser);
            case TASK_COMPLETION, TEAM_TASK, EMPLOYEE_PERFORMANCE, PERSONAL_TASK ->
                    buildTaskReport(request, currentUser);
            case ASSET_ALLOCATION -> buildAssetReport(request, currentUser);
            case TRAINING_PROGRESS -> buildTrainingReport(request, currentUser);
        };
    }

    private ReportResponse buildUserReport(ReportRequest request, User currentUser) {
        List<User> scopedUsers = getScopedUsers(currentUser, request.getEmployeeId());
        List<User> users = scopedUsers.stream()
                .filter(user -> user.getRole() == Role.EMPLOYEE)
                .filter(user -> matchesEmployeeStatus(user.getStatus(), request.getEmployeeStatus()))
                .filter(user -> matchesOnboardingStatus(user.getStatus(), request.getOnboardingStatus()))
                .toList();

        if (request.getReportType() == ReportType.PENDING_ONBOARDING) {
            users = users.stream()
                    .filter(user -> !"COMPLETED".equalsIgnoreCase(user.getStatus()))
                    .toList();
        }
        if (request.getReportType() == ReportType.NEW_JOINERS && request.getStartDate() != null && request.getEndDate() != null) {
            // Users entity has no created-date column; using id ordering surrogate for "latest joiners".
            long minId = users.stream().mapToLong(User::getId).max().orElse(0L) - 10L;
            users = users.stream().filter(user -> user.getId() >= Math.max(minId, 1L)).toList();
        }

        List<String> columns = List.of("Employee Id", "Name", "Username", "Email", "Role", "Status");
        List<ReportRowDto> rows = users.stream()
                .map(user -> ReportRowDto.from(mapOf(
                        "Employee Id", value(user.getId()),
                        "Name", value(user.getName()),
                        "Username", value(user.getUsername()),
                        "Email", value(user.getEmail()),
                        "Role", value(user.getRole()),
                        "Status", value(user.getStatus()))))
                .toList();

        return buildResponse(request.getReportType(), columns, rows);
    }

    private ReportResponse buildTaskReport(ReportRequest request, User currentUser) {
        Set<Long> allowedUserIds = getScopedUsers(currentUser, request.getEmployeeId()).stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        List<Task> tasks = taskRepository.findAll().stream()
                .filter(task -> task.getAssignedTo() != null)
                .filter(task -> allowedUserIds.contains(task.getAssignedTo().getId()))
                .filter(task -> matchesEmployeeStatus(task.getAssignedTo().getStatus(), request.getEmployeeStatus()))
                .filter(task -> matchesOnboardingStatus(task.getAssignedTo().getStatus(), request.getOnboardingStatus()))
                .filter(task -> matchesStatus(task.getStatus(), request.getTaskStatus()))
                .filter(task -> withinDateRange(getLatestTaskHistoryDate(task.getId()), request.getStartDate(), request.getEndDate()))
                .toList();

        List<String> columns = List.of("Task Id", "Title", "Employee", "Task Status", "Employee Status");
        List<ReportRowDto> rows = tasks.stream()
                .map(task -> ReportRowDto.from(mapOf(
                        "Task Id", value(task.getId()),
                        "Title", value(task.getTitle()),
                        "Employee", value(task.getAssignedTo().getName()),
                        "Task Status", value(task.getStatus()),
                        "Employee Status", value(task.getAssignedTo().getStatus()))))
                .toList();

        return buildResponse(request.getReportType(), columns, rows);
    }

    private ReportResponse buildAssetReport(ReportRequest request, User currentUser) {
        Set<Long> allowedUserIds = getScopedUsers(currentUser, request.getEmployeeId()).stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        List<Asset> assets = assetRepository.findAll().stream()
                .filter(asset -> asset.getAssignedTo() != null)
                .filter(asset -> allowedUserIds.contains(asset.getAssignedTo().getId()))
                .filter(asset -> matchesEmployeeStatus(asset.getAssignedTo().getStatus(), request.getEmployeeStatus()))
                .filter(asset -> matchesOnboardingStatus(asset.getAssignedTo().getStatus(), request.getOnboardingStatus()))
                .filter(asset -> withinDateRange(getLatestAssetHistoryDate(asset.getId()), request.getStartDate(), request.getEndDate()))
                .toList();

        List<String> columns = List.of("Asset Id", "Asset Name", "Type", "Serial Number", "Asset Status", "Assigned Employee");
        List<ReportRowDto> rows = assets.stream()
                .map(asset -> ReportRowDto.from(mapOf(
                        "Asset Id", value(asset.getId()),
                        "Asset Name", value(asset.getName()),
                        "Type", value(asset.getType()),
                        "Serial Number", value(asset.getSerialNumber()),
                        "Asset Status", value(asset.getStatus()),
                        "Assigned Employee", value(asset.getAssignedTo().getName()))))
                .toList();

        return buildResponse(request.getReportType(), columns, rows);
    }

    private ReportResponse buildTrainingReport(ReportRequest request, User currentUser) {
        Set<Long> allowedUserIds = getScopedUsers(currentUser, request.getEmployeeId()).stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        List<Training> trainings = trainingRepository.findAll().stream()
                .filter(training -> training.getEmployee() != null)
                .filter(training -> allowedUserIds.contains(training.getEmployee().getId()))
                .filter(training -> matchesEmployeeStatus(training.getEmployee().getStatus(), request.getEmployeeStatus()))
                .filter(training -> matchesOnboardingStatus(training.getEmployee().getStatus(), request.getOnboardingStatus()))
                .filter(training -> withinDateRange(training.getCompletedDate(), request.getStartDate(), request.getEndDate()))
                .toList();

        List<String> columns = List.of("Training Id", "Title", "Employee", "Completion Status", "Completed Date");
        List<ReportRowDto> rows = trainings.stream()
                .map(training -> ReportRowDto.from(mapOf(
                        "Training Id", value(training.getId()),
                        "Title", value(training.getTitle()),
                        "Employee", value(training.getEmployee().getName()),
                        "Completion Status", Boolean.TRUE.equals(training.getCompletionStatus()) ? "Completed" : "Pending",
                        "Completed Date", value(training.getCompletedDate()))))
                .toList();

        return buildResponse(request.getReportType(), columns, rows);
    }

    private List<User> getScopedUsers(User currentUser, Long selectedEmployeeId) {
        List<User> scope = switch (currentUser.getRole()) {
            case ADMIN, HR -> userRepository.findAll();
            case MANAGER -> userRepository.findAll().stream()
                    .filter(user -> user.getRole() == Role.EMPLOYEE)
                    .toList();
            case EMPLOYEE -> List.of(currentUser);
        };

        if (selectedEmployeeId == null) {
            return scope;
        }

        return scope.stream()
                .filter(user -> user.getId().equals(selectedEmployeeId))
                .toList();
    }

    private LocalDateTime getLatestTaskHistoryDate(Long taskId) {
        return taskHistoryRepository.findByTaskId(taskId).stream()
                .map(TaskAssignmentHistory::getAssignmentDate)
                .filter(date -> date != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }

    private LocalDateTime getLatestAssetHistoryDate(Long assetId) {
        return assetHistoryRepository.findByAssetId(assetId).stream()
                .map(AssetAssignmentHistory::getAssignmentDate)
                .filter(date -> date != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }

    private void ensureReportTypeAllowed(Role role, ReportType type) {
        EnumSet<ReportType> allowed = switch (role) {
            case ADMIN -> EnumSet.of(
                    ReportType.ALL_EMPLOYEES,
                    ReportType.ONBOARDING_STATUS,
                    ReportType.TASK_COMPLETION,
                    ReportType.ASSET_ALLOCATION);
            case HR -> EnumSet.of(
                    ReportType.EMPLOYEE_ONBOARDING,
                    ReportType.NEW_JOINERS,
                    ReportType.PENDING_ONBOARDING,
                    ReportType.TRAINING_PROGRESS);
            case MANAGER -> EnumSet.of(
                    ReportType.TEAM_TASK,
                    ReportType.TASK_COMPLETION,
                    ReportType.EMPLOYEE_PERFORMANCE);
            case EMPLOYEE -> EnumSet.of(
                    ReportType.PERSONAL_TASK,
                    ReportType.TRAINING_PROGRESS);
        };

        if (!allowed.contains(type)) {
            throw new IllegalArgumentException("Selected report type is not allowed for your role.");
        }
    }

    private void validateDateRange(ReportRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }
    }

    private boolean withinDateRange(LocalDateTime value, LocalDate start, LocalDate end) {
        if (start == null && end == null) {
            return true;
        }
        if (value == null) {
            return false;
        }
        LocalDateTime startDateTime = start != null ? start.atStartOfDay() : LocalDate.MIN.atStartOfDay();
        LocalDateTime endDateTime = end != null ? end.atTime(LocalTime.MAX) : LocalDate.MAX.atTime(LocalTime.MIN);
        return !value.isBefore(startDateTime) && !value.isAfter(endDateTime);
    }

    private boolean matchesStatus(String value, String filter) {
        if (filter == null || filter.isBlank()) {
            return true;
        }
        return normalizeStatus(value).equals(normalizeStatus(filter));
    }

    private boolean matchesEmployeeStatus(String value, String filter) {
        return matchesStatus(value, filter);
    }

    private boolean matchesOnboardingStatus(String currentStatus, String filter) {
        if (filter == null || filter.isBlank()) {
            return true;
        }

        String normalizedFilter = normalizeStatus(filter);
        String normalizedCurrent = normalizeStatus(currentStatus);

        if ("COMPLETED".equals(normalizedFilter)) {
            return "COMPLETED".equals(normalizedCurrent);
        }
        if ("PENDING".equals(normalizedFilter)) {
            return !"COMPLETED".equals(normalizedCurrent);
        }

        return normalizedCurrent.equals(normalizedFilter);
    }

    private String normalizeStatus(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replace(' ', '_').toUpperCase();
    }

    private ReportResponse buildResponse(ReportType reportType, List<String> columns, List<ReportRowDto> rows) {
        ReportResponse response = new ReportResponse();
        response.setReportType(reportType);
        response.setReportName(formatReportName(reportType));
        response.setGeneratedAt(LocalDateTime.now());
        response.setColumns(new ArrayList<>(columns));
        response.setRows(rows);
        response.setTotalRecords(rows.size());
        return response;
    }

    private String formatReportName(ReportType reportType) {
        String[] tokens = reportType.name().split("_");
        StringBuilder builder = new StringBuilder();
        for (String token : tokens) {
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(token.substring(0, 1)).append(token.substring(1).toLowerCase());
        }
        return builder.toString();
    }

    private Map<String, String> mapOf(String... keyValuePairs) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int index = 0; index < keyValuePairs.length; index += 2) {
            map.put(keyValuePairs[index], keyValuePairs[index + 1]);
        }
        return map;
    }

    private String value(Object value) {
        return value == null ? "-" : String.valueOf(value);
    }
}
