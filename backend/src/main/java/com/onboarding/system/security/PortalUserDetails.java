package com.onboarding.system.security;

import com.onboarding.system.entity.Role;
import com.onboarding.system.entity.User;
import com.onboarding.system.onboarding.EmployeeLifecycleStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class PortalUserDetails implements UserDetails {

    private final User user;

    public PortalUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public String getAccessDeniedMessage() {
        if (EmployeeLifecycleStatus.isDeactivated(user.getStatus())) {
            return "Your account has been deactivated. Please contact administrator.";
        }
        if (user.getRole() == Role.EMPLOYEE) {
            return "Your account is not activated yet. Please contact HR.";
        }
        return "Your account is not active. Please contact an administrator.";
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return EmployeeLifecycleStatus.isLoginAllowed(user.getStatus());
    }
}
