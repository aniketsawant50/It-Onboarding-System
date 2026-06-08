package com.onboarding.system.repository;

import com.onboarding.system.entity.OnboardingTimelineEvent;
import com.onboarding.system.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OnboardingTimelineEventRepository extends JpaRepository<OnboardingTimelineEvent, Long> {
    List<OnboardingTimelineEvent> findByEmployeeOrderByCreatedAtAsc(User employee);
}
