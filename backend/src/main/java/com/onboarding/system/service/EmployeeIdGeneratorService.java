package com.onboarding.system.service;

import com.onboarding.system.entity.User;
import com.onboarding.system.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class EmployeeIdGeneratorService {

    private static final String PREFIX = "EMP";
    private static final int PAD_WIDTH = 3;

    private final UserRepository userRepository;

    public EmployeeIdGeneratorService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public synchronized String generateNextEmployeeId() {
        int nextNumber = userRepository.findAll().stream()
                .map(User::getEmployeeId)
                .mapToInt(this::extractEmployeeNumber)
                .max()
                .orElse(0) + 1;

        String employeeId;
        do {
            employeeId = formatEmployeeId(nextNumber);
            nextNumber++;
        } while (userRepository.existsByEmployeeId(employeeId));

        return employeeId;
    }

    public synchronized void assignMissingEmployeeIds(List<User> users) {
        for (User user : users) {
            if (user.getEmployeeId() == null || user.getEmployeeId().isBlank()) {
                user.setEmployeeId(generateNextEmployeeId());
                userRepository.save(user);
            }
        }
    }

    private String formatEmployeeId(int number) {
        return PREFIX + String.format(Locale.ROOT, "%0" + PAD_WIDTH + "d", number);
    }

    private int extractEmployeeNumber(String employeeId) {
        if (employeeId == null || !employeeId.startsWith(PREFIX)) {
            return 0;
        }

        try {
            return Integer.parseInt(employeeId.substring(PREFIX.length()));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }
}
