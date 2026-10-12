import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LOCAL_STORAGE_KEYS } from '../constants.js';
import { auth } from '../utils/auth.js';
import { SessionPropTypes, UserPropTypes } from '../types.js';

const initialState = {
  token: null,
  user: null,
  expiresAt: null,
  isLoading: false,
  error: null
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login user
       * @param {string} username
       * @param {string} password
       * @returns {Promise<void>}
       */
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await auth.login(username, password);
          const expiresAt = JSON.parse(atob(token.split('.')[1])).exp * 1000;
          set({
            token,
            user,
            expiresAt,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Login as admin
       * @returns {Promise<void>}
       */
      loginAsAdmin: async () => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await auth.loginAsAdmin();
          const expiresAt = JSON.parse(atob(token.split('.')[1])).exp * 1000;
          set({
            token,
            user,
            expiresAt,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.message || 'Admin login failed',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Logout user
       * @returns {Promise<void>}
       */
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await auth.logout();
          set(initialState);
        } catch (error) {
          set({
            error: error.message || 'Logout failed',
            isLoading: false
          });
          throw error;
        }
      },

      /**
       * Check if user is authenticated
       * @returns {boolean}
       */
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        if (!token) return false;
        return expiresAt > Date.now();
      },

      /**
       * Get current session
       * @returns {Object|null}
       */
      getSession: () => {
        const { token, user, expiresAt } = get();
        if (!token || expiresAt <= Date.now()) return null;
        return { token, user, expiresAt };
      },

      /**
       * Check if current user is admin
       * @returns {boolean}
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: LOCAL_STORAGE_KEYS.AUTH_TOKEN,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt
      })
    }
  )
);

export const AuthStorePropTypes = {
  token: PropTypes.string,
  user: PropTypes.shape(UserPropTypes),
  expiresAt: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  login: PropTypes.func.isRequired,
  loginAsAdmin: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.func.isRequired,
  getSession: PropTypes.func.isRequired,
  isAdmin: PropTypes.func.isRequired,
  clearError: PropTypes.func.isRequired
};