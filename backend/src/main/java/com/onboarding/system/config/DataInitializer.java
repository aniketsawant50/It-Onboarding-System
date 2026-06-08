package com.onboarding.system.config;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.UserRepository;
import com.onboarding.system.service.EmployeeIdGeneratorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "Pass@123";

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmployeeIdGeneratorService employeeIdGeneratorService) {
        return args -> {
            User user = userRepository.findByUsername(ADMIN_USERNAME).orElseGet(User::new);
            if (user.getEmployeeId() == null || user.getEmployeeId().isBlank()) {
                user.setEmployeeId(employeeIdGeneratorService.generateNextEmployeeId());
            }
            user.setFirstName("Admin");
            user.setLastName("User");
            user.setContactNumber("9999999999");
            user.setGender("Other");
            user.setName("Admin");
            user.setUsername(ADMIN_USERNAME);
            user.setEmail("admin@itportal.local");
            user.setOrganizationEmail("admin@company.local");
            user.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            user.setRole(Role.ADMIN);
            user.setStatus("ACTIVE");
            userRepository.save(user);

            employeeIdGeneratorService.assignMissingEmployeeIds(userRepository.findAll());
        };
    }
}