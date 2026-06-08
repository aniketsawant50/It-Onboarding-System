package com.onboarding.system.repository;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByOrganizationEmail(String organizationEmail);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByOrganizationEmailAndIdNot(String organizationEmail, Long id);
    long countByRoleAndStatus(Role role, String status);
    long countByRoleAndReportingManagerIsNotNull(Role role);
}
