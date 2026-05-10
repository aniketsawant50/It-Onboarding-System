/**
 * Data Formatting Utilities
 */

/**
 * Format date to display format (MM/DD/YYYY)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Format datetime to display format (MM/DD/YYYY HH:MM AM/PM)
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  const d = new Date(datetime);
  const date = formatDate(datetime);
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
};

/**
 * Format number as currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert role name to display label
 */
export const formatRoleName = (role) => {
  if (!role) return '';
  return role
    .split('_')
    .map(part => capitalize(part.toLowerCase()))
    .join(' ');
};
