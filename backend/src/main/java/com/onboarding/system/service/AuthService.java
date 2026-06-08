package com.onboarding.system.service;

import com.onboarding.system.dto.ForgotPasswordRequest;
import com.onboarding.system.dto.LoginRequest;
import com.onboarding.system.dto.LoginResponse;
import com.onboarding.system.dto.UserDto;
import com.onboarding.system.entity.User;
import com.onboarding.system.onboarding.EmployeeLifecycleStatus;
import com.onboarding.system.repository.UserRepository;
import com.onboarding.system.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (!EmployeeLifecycleStatus.isLoginAllowed(user.getStatus())) {
            if (EmployeeLifecycleStatus.isDeactivated(user.getStatus())) {
                throw new IllegalArgumentException("Your account has been deactivated. Please contact administrator.");
            }
            throw new IllegalArgumentException("Your account is not activated yet. Please contact HR.");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, UserDto.fromEntity(user));
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email not found in the system"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
