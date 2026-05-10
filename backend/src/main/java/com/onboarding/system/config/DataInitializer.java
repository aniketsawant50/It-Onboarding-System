package com.onboarding.system.config;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    private static final String SUPER_ADMIN_USERNAME = "superadmin";
    private static final String SUPER_ADMIN_PASSWORD = "Pass@123";

    @Bean
    CommandLineRunner seedSuperAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            User user = userRepository.findByUsername(SUPER_ADMIN_USERNAME).orElseGet(User::new);
            user.setName("Super Admin");
            user.setUsername(SUPER_ADMIN_USERNAME);
            user.setEmail("superadmin@itportal.local");
            user.setPassword(passwordEncoder.encode(SUPER_ADMIN_PASSWORD));
            user.setRole(Role.ADMIN);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        };
    }
}
