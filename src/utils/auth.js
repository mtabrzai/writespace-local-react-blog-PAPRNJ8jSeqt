import { LOCAL_STORAGE_KEYS, API_ENDPOINTS, DEFAULT_ADMIN_CREDENTIALS } from '../constants.js';
import { storage, getAuthToken, setAuthToken, removeAuthToken } from './storage.js';
import { SessionPropTypes, UserPropTypes } from '../types.js';

export const auth = {
  /**
   * Login with credentials
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{token: string, user: Object}>}
   */
  login: async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setAuthToken(data.token);
      storage.set(LOCAL_STORAGE_KEYS.USER_PREFERENCES, data.user.preferences || {});
      return { token: data.token, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Login as admin with default credentials
   * @returns {Promise<{token: string, user: Object}>}
   */
  loginAsAdmin: async () => {
    return auth.login(DEFAULT_ADMIN_CREDENTIALS.USERNAME, DEFAULT_ADMIN_CREDENTIALS.PASSWORD);
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      const token = getAuthToken();
      if (token) {
        await fetch(API_ENDPOINTS.AUTH_LOGOUT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      storage.remove(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = getAuthToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  },

  /**
   * Get current session
   * @returns {Object|null}
   */
  getSession: () => {
    if (!auth.isAuthenticated()) return null;

    try {
      const token = getAuthToken();
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        token,
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          role: payload.role,
          createdAt: new Date(payload.iat * 1000).toISOString(),
          updatedAt: new Date(payload.updatedAt * 1000).toISOString(),
        },
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Failed to parse session:', error);
      return null;
    }
  },

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  isAdmin: () => {
    const session = auth.getSession();
    return session?.user?.role === 'admin';
  },

  /**
   * Get auth headers for API requests
   * @returns {Object}
   */
  getAuthHeaders: () => {
    const token = getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },
};

export const AuthPropTypes = {
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.func.isRequired,
  getSession: PropTypes.func.isRequired,
  isAdmin: PropTypes.func.isRequired,
  getAuthHeaders: PropTypes.func.isRequired,
};