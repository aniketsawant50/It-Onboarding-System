package com.onboarding.system.service;

import com.onboarding.system.dto.TaskRequest;
import com.onboarding.system.dto.UpdateTaskStatusRequest;
import com.onboarding.system.entity.Task;
import com.onboarding.system.entity.TaskAssignmentHistory;
import com.onboarding.system.repository.TaskRepository;
import com.onboarding.system.repository.TaskAssignmentHistoryRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentHistoryRepository taskHistoryRepository;
    private final UserService userService;

    public TaskService(TaskRepository taskRepository, TaskAssignmentHistoryRepository taskHistoryRepository, UserService userService) {
        this.taskRepository = taskRepository;
        this.taskHistoryRepository = taskHistoryRepository;
        this.userService = userService;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(TaskRequest request, Authentication authentication) {
        Task task = new Task();
        LocalDateTime createdDate = LocalDateTime.now();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssignedTo(userService.findById(request.getAssignedTo()));
        task.setStatus(request.getStatus());
        task.setTaskCreatedDate(createdDate);
        if (request.getCompletionDate() != null) {
            validateManager(authentication);
            validateCompletionDate(createdDate, request.getCompletionDate());
            task.setCompletionDate(request.getCompletionDate());
        }
        validateCompletedTask(task.getStatus(), task.getCompletionDate());
        Task savedTask = taskRepository.save(task);

        // Record history for task creation
        TaskAssignmentHistory history = new TaskAssignmentHistory(
                savedTask,
                savedTask.getAssignedTo(),
                "NEW",
                request.getStatus(),
                "Task created and assigned"
        );
        taskHistoryRepository.save(history);

        return savedTask;
    }

    public Task updateTaskStatus(Long id, UpdateTaskStatusRequest request, Authentication authentication) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        String previousStatus = task.getStatus();
        if (request.getCompletionDate() != null) {
            validateManager(authentication);
            validateCompletionDate(task.getTaskCreatedDate(), request.getCompletionDate());
            task.setCompletionDate(request.getCompletionDate());
        }
        task.setStatus(request.getStatus());
        validateCompletedTask(task.getStatus(), task.getCompletionDate());
        Task updatedTask = taskRepository.save(task);

        // Record history for status change
        TaskAssignmentHistory history = new TaskAssignmentHistory(
                updatedTask,
                updatedTask.getAssignedTo(),
                previousStatus,
                request.getStatus(),
                "Status updated"
        );
        taskHistoryRepository.save(history);

        return updatedTask;
    }

    private void validateManager(Authentication authentication) {
        boolean isManager = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_MANAGER".equals(authority.getAuthority()));
        if (!isManager) {
            throw new IllegalArgumentException("Only managers can update completion date");
        }
    }

    private void validateCompletionDate(LocalDateTime taskCreatedDate, LocalDate completionDate) {
        if (taskCreatedDate != null && completionDate.isBefore(taskCreatedDate.toLocalDate())) {
            throw new IllegalArgumentException("Completion date cannot be before task created date");
        }
    }

    private void validateCompletedTask(String status, LocalDate completionDate) {
        if ("COMPLETED".equals(status) && completionDate == null) {
            throw new IllegalArgumentException("Completion date is required when task status is COMPLETED");
        }
    }
}
