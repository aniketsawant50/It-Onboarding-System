package com.onboarding.system.controller;

import com.onboarding.system.dto.TrainingDto;
import com.onboarding.system.dto.TrainingRequest;
import com.onboarding.system.service.TrainingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    public List<TrainingDto> getTraining() {
        return trainingService.getAllTraining().stream()
                .map(TrainingDto::fromEntity)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public TrainingDto createTraining(@Valid @RequestBody TrainingRequest request) {
        return TrainingDto.fromEntity(trainingService.createTraining(request));
    }
}
