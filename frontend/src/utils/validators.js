/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9+()\-\s]{10,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if field is not empty
 */
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

/**
 * Format and validate phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
