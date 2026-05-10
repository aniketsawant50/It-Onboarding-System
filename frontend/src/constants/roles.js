/**
 * User Roles Constants
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.HR]: 'HR Manager',
  [USER_ROLES.MANAGER]: 'Team Manager',
  [USER_ROLES.EMPLOYEE]: 'Employee',
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_roles',
    'view_all_reports',
    'system_settings',
  ],
  [USER_ROLES.HR]: [
    'manage_employees',
    'manage_tasks',
    'view_reports',
    'onboarding_management',
  ],
  [USER_ROLES.MANAGER]: [
    'manage_team',
    'assign_tasks',
    'view_team_tasks',
    'approve_tasks',
  ],
  [USER_ROLES.EMPLOYEE]: [
    'view_tasks',
    'complete_tasks',
    'view_profile',
  ],
};
