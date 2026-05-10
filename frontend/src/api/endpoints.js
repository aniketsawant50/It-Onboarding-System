/**
 * API Endpoints Configuration
 * Centralized definition of all backend API endpoints
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    LIST: '/users',
    GET: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Employees
  EMPLOYEES: {
    LIST: '/employees',
    GET: (id) => `/employees/${id}`,
    CREATE: '/employees',
    UPDATE: (id) => `/employees/${id}`,
    DELETE: (id) => `/employees/${id}`,
  },

  // Onboarding Tasks
  TASKS: {
    LIST: '/tasks',
    GET: (id) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id) => `/tasks/${id}`,
    DELETE: (id) => `/tasks/${id}`,
  },

  // Assets
  ASSETS: {
    LIST: '/assets',
    ASSIGN: '/assets/assign',
    RETURN: '/assets/return',
  },

  // Roles
  ROLES: {
    LIST: '/roles',
    GET: (id) => `/roles/${id}`,
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ADMIN: '/dashboard/admin',
    MANAGER: '/dashboard/manager',
    EMPLOYEE: '/dashboard/employee',
  },
};
