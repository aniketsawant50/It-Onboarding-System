package com.onboarding.system.service;

import com.onboarding.system.dto.TaskRequest;
import com.onboarding.system.entity.Task;
import com.onboarding.system.entity.TaskAssignmentHistory;
import com.onboarding.system.repository.TaskRepository;
import com.onboarding.system.repository.TaskAssignmentHistoryRepository;
import java.util.List;
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

    public Task createTask(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssignedTo(userService.findById(request.getAssignedTo()));
        task.setStatus(request.getStatus());
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

    public Task updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        String previousStatus = task.getStatus();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);

        // Record history for status change
        TaskAssignmentHistory history = new TaskAssignmentHistory(
                updatedTask,
                updatedTask.getAssignedTo(),
                previousStatus,
                status,
                "Status updated"
        );
        taskHistoryRepository.save(history);

        return updatedTask;
    }
}
