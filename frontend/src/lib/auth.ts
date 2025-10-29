// Authentication helper functions for token management

const TOKEN_KEY = 'auth_token';

/**
 * Get the authentication token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the authentication token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated (token exists)
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
