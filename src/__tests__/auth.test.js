import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS, DEFAULT_ADMIN_CREDENTIALS } from '../constants';

describe('auth utility', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQxMDI0NDQ4MDAsInVwZGF0ZWRBdCI6MTUxNjIzOTAyMn0.fake_signature';
  const mockUser = {
    id: '1234567890',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };
  const mockPreferences = { theme: 'light' };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.spyOn(storage, 'set').mockImplementation(() => true);
    vi.spyOn(storage, 'remove').mockImplementation(() => true);
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === LOCAL_STORAGE_KEYS.AUTH_TOKEN) return mockToken;
      if (key === LOCAL_STORAGE_KEYS.USER_PREFERENCES) return mockPreferences;
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ token: mockToken, user: mockUser })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await auth.login('testuser', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      });
      expect(storage.set).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.AUTH_TOKEN, mockToken);
      expect(storage.set).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.USER_PREFERENCES, {});
      expect(result).toEqual({ token: mockToken, user: mockUser });
    });

    it('should throw error when login fails', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Invalid credentials' })
      };
      global.fetch.mockResolvedValue(mockResponse);

      await expect(auth.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(auth.login('testuser', 'password123')).rejects.toThrow('Network error');
      expect(storage.set).not.toHaveBeenCalled();
    });
  });

  describe('loginAsAdmin', () => {
    it('should successfully login as admin with default credentials', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ token: mockToken, user: { ...mockUser, role: 'admin' } })
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await auth.loginAsAdmin();

      expect(global.fetch).toHaveBeenCalledWith(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: DEFAULT_ADMIN_CREDENTIALS.USERNAME,
          password: DEFAULT_ADMIN_CREDENTIALS.PASSWORD
        })
      });
      expect(result).toEqual({ token: mockToken, user: { ...mockUser, role: 'admin' } });
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockResponse = { ok: true };
      global.fetch.mockResolvedValue(mockResponse);

      await auth.logout();

      expect(global.fetch).toHaveBeenCalledWith(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
    });

    it('should handle logout when no token exists', async () => {
      vi.spyOn(storage, 'get').mockReturnValue(null);

      await auth.logout();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
    });

    it('should handle fetch errors during logout', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await auth.logout();

      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      expect(storage.remove).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and is not expired', () => {
      const result = auth.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTE2MjM5MDIyfQ.fake_signature';
      vi.spyOn(storage, 'get').mockReturnValue(expiredToken);

      const result = auth.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when no token exists', () => {
      vi.spyOn(storage, 'get').mockReturnValue(null);

      const result = auth.isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false when token is malformed', () => {
      vi.spyOn(storage, 'get').mockReturnValue('invalid.token');

      const result = auth.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return session when authenticated', () => {
      const session = auth.getSession();
      expect(session).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: new Date(1516239022000).toISOString(),
          updatedAt: new Date(1516239022000).toISOString()
        },
        expiresAt: new Date(4102444800000).toISOString()
      });
    });

    it('should return null when not authenticated', () => {
      vi.spyOn(storage, 'get').mockReturnValue(null);

      const session = auth.getSession();
      expect(session).toBeNull();
    });

    it('should return null when token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTE2MjM5MDIyfQ.fake_signature';
      vi.spyOn(storage, 'get').mockReturnValue(expiredToken);

      const session = auth.getSession();
      expect(session).toBeNull();
    });

    it('should return null when token is malformed', () => {
      vi.spyOn(storage, 'get').mockReturnValue('invalid.token');

      const session = auth.getSession();
      expect(session).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is admin', () => {
      const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo0MTAyNDQ0ODAwfQ.fake_signature';
      vi.spyOn(storage, 'get').mockReturnValue(adminToken);

      const result = auth.isAdmin();
      expect(result).toBe(true);
    });

    it('should return false when user is not admin', () => {
      const result = auth.isAdmin();
      expect(result).toBe(false);
    });

    it('should return false when not authenticated', () => {
      vi.spyOn(storage, 'get').mockReturnValue(null);

      const result = auth.isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('getAuthHeaders', () => {
    it('should return auth headers when token exists', () => {
      const headers = auth.getAuthHeaders();
      expect(headers).toEqual({ 'Authorization': `Bearer ${mockToken}` });
    });

    it('should return empty object when no token exists', () => {
      vi.spyOn(storage, 'get').mockReturnValue(null);

      const headers = auth.getAuthHeaders();
      expect(headers).toEqual({});
    });
  });
});

describe('useAuthStore', () => {
  const { useAuthStore } = await import('../store/useAuthStore');
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjQxMDI0NDQ4MDB9.fake_signature';
  const mockUser = {
    id: '1234567890',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should initialize with default state', () => {
    const store = useAuthStore.getState();
    expect(store).toEqual({
      token: null,
      user: null,
      expiresAt: null,
      isLoading: false,
      error: null
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ token: mockToken, user: mockUser })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const { login } = useAuthStore.getState();
    await login('testuser', 'password123');

    const store = useAuthStore.getState();
    expect(store.token).toBe(mockToken);
    expect(store.user).toEqual(mockUser);
    expect(store.expiresAt).toBe(4102444800000);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should handle login error', async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({ message: 'Invalid credentials' })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const { login } = useAuthStore.getState();
    await expect(login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');

    const store = useAuthStore.getState();
    expect(store.error).toBe('Invalid credentials');
    expect(store.isLoading).toBe(false);
  });

  it('should login as admin successfully', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ token: mockToken, user: { ...mockUser, role: 'admin' } })
    };
    global.fetch.mockResolvedValue(mockResponse);

    const { loginAsAdmin } = useAuthStore.getState();
    await loginAsAdmin();

    const store = useAuthStore.getState();
    expect(store.user?.role).toBe('admin');
  });

  it('should logout successfully', async () => {
    const mockResponse = { ok: true };
    global.fetch.mockResolvedValue(mockResponse);

    // First login to set state
    const loginResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ token: mockToken, user: mockUser })
    };
    global.fetch.mockResolvedValueOnce(loginResponse);

    const { login, logout } = useAuthStore.getState();
    await login('testuser', 'password123');
    await logout();

    const store = useAuthStore.getState();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.expiresAt).toBeNull();
  });

  it('should check if authenticated', () => {
    const { isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated()).toBe(false);

    // Set state directly for testing
    useAuthStore.setState({
      token: mockToken,
      expiresAt: Date.now() + 100000
    });
    expect(isAuthenticated()).toBe(true);
  });

  it('should get session', () => {
    const { getSession } = useAuthStore.getState();
    expect(getSession()).toBeNull();

    // Set state directly for testing
    useAuthStore.setState({
      token: mockToken,
      user: mockUser,
      expiresAt: Date.now() + 100000
    });
    const session = getSession();
    expect(session).toBeDefined();
    expect(session?.token).toBe(mockToken);
    expect(session?.user).toEqual(mockUser);
  });

  it('should check if admin', () => {
    const { isAdmin } = useAuthStore.getState();
    expect(isAdmin()).toBe(false);

    // Set state with admin user
    useAuthStore.setState({
      user: { ...mockUser, role: 'admin' }
    });
    expect(isAdmin()).toBe(true);
  });

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Some error' });
    const { clearError } = useAuthStore.getState();
    clearError();

    const store = useAuthStore.getState();
    expect(store.error).toBeNull();
  });

  it('should persist state to localStorage', () => {
    useAuthStore.setState({
      token: mockToken,
      user: mockUser,
      expiresAt: 4102444800000
    });

    const persistedState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || '{}');
    expect(persistedState.state.token).toBe(mockToken);
    expect(persistedState.state.user).toEqual(mockUser);
    expect(persistedState.state.expiresAt).toBe(4102444800000);
  });
});