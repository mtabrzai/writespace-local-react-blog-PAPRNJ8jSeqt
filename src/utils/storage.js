import { LOCAL_STORAGE_KEYS } from '../constants.js';

export const storage = {
  get: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Convenience methods for app-specific keys
export const getAuthToken = () => storage.get(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
export const setAuthToken = (token) => storage.set(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
export const removeAuthToken = () => storage.remove(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

export const getUserPreferences = () => storage.get(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
export const setUserPreferences = (preferences) => storage.set(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences);
export const removeUserPreferences = () => storage.remove(LOCAL_STORAGE_KEYS.USER_PREFERENCES);

export const getDocumentContent = (documentId) => storage.get(`${LOCAL_STORAGE_KEYS.DOCUMENT_CONTENT}_${documentId}`);
export const setDocumentContent = (documentId, content) => storage.set(`${LOCAL_STORAGE_KEYS.DOCUMENT_CONTENT}_${documentId}`, content);
export const removeDocumentContent = (documentId) => storage.remove(`${LOCAL_STORAGE_KEYS.DOCUMENT_CONTENT}_${documentId}`);