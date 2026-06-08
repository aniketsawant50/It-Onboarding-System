package com.onboarding.system.service;

import com.onboarding.system.entity.HrAuditLog;
import com.onboarding.system.entity.OnboardingTimelineEvent;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.HrAuditLogRepository;
import com.onboarding.system.repository.OnboardingTimelineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OnboardingLedgerService {

    public static final String EVENT_ACCOUNT_CREATED = "ACCOUNT_CREATED";
    public static final String EVENT_HR_REVIEW_STARTED = "HR_VERIFICATION_STARTED";
    public static final String EVENT_QUERY_TO_ADMIN = "QUERY_TO_ADMIN";
    public static final String EVENT_REJECTED = "EMPLOYEE_REJECTED";
    public static final String EVENT_ASSET_APPROVED = "ASSET_APPROVED";
    public static final String EVENT_ASSET_REJECTED = "ASSET_REJECTED";
    public static final String EVENT_MANAGER_ASSIGNED = "MANAGER_ASSIGNED";
    public static final String EVENT_ACTIVATED = "EMPLOYEE_ACTIVATED";
    public static final String EVENT_RESUBMITTED_TO_HR = "RESUBMITTED_TO_HR";

    private final OnboardingTimelineEventRepository timelineRepository;
    private final HrAuditLogRepository auditLogRepository;

    public OnboardingLedgerService(
            OnboardingTimelineEventRepository timelineRepository,
            HrAuditLogRepository auditLogRepository) {
        this.timelineRepository = timelineRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void appendTimeline(User employee, String eventType, String details, User performedBy) {
        timelineRepository.save(new OnboardingTimelineEvent(employee, eventType, details, performedBy));
    }

    @Transactional
    public void appendHrAudit(User employee, String action, User performedBy, String remarks) {
        auditLogRepository.save(new HrAuditLog(employee, action, performedBy, remarks));
    }
}
