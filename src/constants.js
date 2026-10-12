export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'writespace_auth_token',
  USER_PREFERENCES: 'writespace_user_preferences',
  DOCUMENT_CONTENT: 'writespace_document_content'
};

export const DEFAULT_ADMIN_CREDENTIALS = {
  USERNAME: 'admin',
  PASSWORD: 'admin123'
};

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DOCUMENT: '/document/:id',
  SETTINGS: '/settings',
  ADMIN: '/admin'
};

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  DOCUMENTS: '/api/documents',
  USERS: '/api/users',
  PREFERENCES: '/api/preferences'
};

export const APP_CONSTANTS = {
  APP_NAME: 'Writespace',
  MAX_DOCUMENT_TITLE_LENGTH: 100,
  DEFAULT_DOCUMENT_ID: 'new',
  DEBOUNCE_DELAY_MS: 300
};