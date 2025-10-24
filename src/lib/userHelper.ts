// User Helper - Get current user information from localStorage
// This provides a lightweight way to access user info without requiring AuthContext

export interface CurrentUser {
  id: string;
  username: string;
  crew?: string;
}

const CURRENT_USER_KEY = 'cancontrol_current_user';

/**
 * Get current user ID from localStorage
 * Falls back to a guest ID if not logged in
 */
export const getCurrentUserId = (): string => {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (userData) {
      const user: CurrentUser = JSON.parse(userData);
      return user.id;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  // Return guest ID if no user found
  return 'guest';
};

/**
 * Get full current user information
 */
export const getCurrentUser = (): CurrentUser => {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  // Return guest user if no user found
  return {
    id: 'guest',
    username: 'Guest',
    crew: undefined,
  };
};

/**
 * Set current user information (called on login/profile update)
 */
export const setCurrentUser = (user: CurrentUser): void => {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

/**
 * Clear current user information (called on logout)
 */
export const clearCurrentUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};
