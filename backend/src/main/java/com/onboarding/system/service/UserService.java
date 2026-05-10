package com.onboarding.system.service;

import com.onboarding.system.dto.CreateUserRequest;
import com.onboarding.system.dto.UpdateUserAccessRequest;
import com.onboarding.system.dto.UpdateProfileRequest;
import com.onboarding.system.entity.User;
import com.onboarding.system.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(CreateUserRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setContactNumber(request.getContactNumber());
        user.setGender(request.getGender());
        user.setName(resolveDisplayName(request));
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public User updateUserAccess(Long id, UpdateUserAccessRequest request) {
        User user = findById(id);
        user.setRole(request.getRole());
        user.setStatus(request.getStatus());
        return userRepository.save(user);
    }

    public User updateStatus(Long id, String status) {
        User user = findById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }

    public User getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    public User updateCurrentUserProfile(Authentication authentication, UpdateProfileRequest request) {
        User user = getCurrentUser(authentication);
        if (userRepository.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        user.setGender(request.getGender());
        user.setDateOfBirth(request.getDateOfBirth());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return userRepository.save(user);
    }

    private String resolveDisplayName(CreateUserRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            return request.getName();
        }
        return (request.getFirstName() + " " + request.getLastName()).trim();
    }
}
