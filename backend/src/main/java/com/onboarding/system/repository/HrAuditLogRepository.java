package com.onboarding.system.repository;

import com.onboarding.system.entity.HrAuditLog;
import com.onboarding.system.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HrAuditLogRepository extends JpaRepository<HrAuditLog, Long> {
    List<HrAuditLog> findByEmployeeOrderByCreatedAtDesc(User employee);
}
