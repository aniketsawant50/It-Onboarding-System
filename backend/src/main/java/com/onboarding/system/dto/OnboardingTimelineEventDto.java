package com.onboarding.system.dto;

import com.onboarding.system.entity.OnboardingTimelineEvent;
import java.time.LocalDateTime;

public class OnboardingTimelineEventDto {

    private Long id;
    private String eventType;
    private String details;
    private String performedByName;
    private LocalDateTime createdAt;

    public static OnboardingTimelineEventDto fromEntity(OnboardingTimelineEvent event) {
        OnboardingTimelineEventDto dto = new OnboardingTimelineEventDto();
        dto.id = event.getId();
        dto.eventType = event.getEventType();
        dto.details = event.getDetails();
        dto.performedByName = event.getPerformedBy() != null ? event.getPerformedBy().getName() : null;
        dto.createdAt = event.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getEventType() {
        return eventType;
    }

    public String getDetails() {
        return details;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
