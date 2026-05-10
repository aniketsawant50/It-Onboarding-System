package com.onboarding.system.repository;

import com.onboarding.system.entity.TaskAssignmentHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskAssignmentHistoryRepository extends JpaRepository<TaskAssignmentHistory, Long> {
    List<TaskAssignmentHistory> findByTaskId(Long taskId);
    List<TaskAssignmentHistory> findByAssignedToId(Long assignedToId);
}
