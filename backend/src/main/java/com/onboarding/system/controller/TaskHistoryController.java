package com.onboarding.system.controller;

import com.onboarding.system.entity.TaskAssignmentHistory;
import com.onboarding.system.repository.TaskAssignmentHistoryRepository;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/task-history")
public class TaskHistoryController {

    private final TaskAssignmentHistoryRepository taskHistoryRepository;

    public TaskHistoryController(TaskAssignmentHistoryRepository taskHistoryRepository) {
        this.taskHistoryRepository = taskHistoryRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public List<TaskAssignmentHistory> getAllHistory() {
        return taskHistoryRepository.findAll();
    }

    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<TaskAssignmentHistory> getTaskHistory(@PathVariable Long taskId) {
        return taskHistoryRepository.findByTaskId(taskId);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<TaskAssignmentHistory> getEmployeeHistory(@PathVariable Long employeeId) {
        return taskHistoryRepository.findByAssignedToId(employeeId);
    }
}
