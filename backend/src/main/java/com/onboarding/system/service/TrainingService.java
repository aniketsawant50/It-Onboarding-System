package com.onboarding.system.service;

import com.onboarding.system.dto.TrainingRequest;
import com.onboarding.system.entity.Training;
import com.onboarding.system.repository.TrainingRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final UserService userService;

    public TrainingService(TrainingRepository trainingRepository, UserService userService) {
        this.trainingRepository = trainingRepository;
        this.userService = userService;
    }

    public List<Training> getAllTraining() {
        return trainingRepository.findAll();
    }

    public Training createTraining(TrainingRequest request) {
        Training training = new Training();
        training.setTitle(request.getTitle());
        training.setCompletionStatus(Boolean.TRUE.equals(request.getCompletionStatus()));
        training.setEmployee(userService.findById(request.getEmployeeId()));
        return trainingRepository.save(training);
    }
}
