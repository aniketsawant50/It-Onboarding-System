package com.onboarding.system.repository;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> roleEquals(Role role) {
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> statusEqualsIgnoreCase(String status) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(status)) {
                return cb.conjunction();
            }
            return cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase());
        };
    }

    public static Specification<User> nameOrEmailContains(String q) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(q)) {
                return cb.conjunction();
            }
            String pattern = "%" + q.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("username")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("organizationEmail")), pattern),
                    cb.like(cb.lower(root.get("employeeId")), pattern));
        };
    }

    public static Specification<User> departmentContains(String department) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(department)) {
                return cb.conjunction();
            }
            String pattern = "%" + department.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("department")), pattern);
        };
    }

    public static Specification<User> jobTitleContains(String jobTitle) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(jobTitle)) {
                return cb.conjunction();
            }
            String pattern = "%" + jobTitle.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("jobTitle")), pattern);
        };
    }

    public static Specification<User> reportingManagerIdEquals(Long managerId) {
        return (root, query, cb) -> {
            if (managerId == null) {
                return cb.conjunction();
            }
            Join<User, User> managerJoin = root.join("reportingManager", JoinType.LEFT);
            return cb.equal(managerJoin.get("id"), managerId);
        };
    }
}
