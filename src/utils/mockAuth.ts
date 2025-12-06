// Mock authentication service for demo without backend
const USERS_KEY = 'job_portal_users';
const CURRENT_USER_KEY = 'job_portal_current_user';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

const getStoredUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default admin user
  const defaultUsers: StoredUser[] = [
    {
      id: 'admin-1',
      email: 'admin@demo.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN',
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Generate a mock JWT token
const generateMockToken = (user: StoredUser): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 24, // 24 hours
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

export const mockAuthService = {
  login: async (email: string, password: string): Promise<{ token: string; refreshToken: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    if (user.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    const token = generateMockToken(user);
    const refreshToken = btoa(JSON.stringify({ userId: user.id, type: 'refresh' }));

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return { token, refreshToken };
  },

  register: async (data: { email: string; password: string; name: string }): Promise<{ token: string; refreshToken: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const users = getStoredUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

    if (existingUser) {
      throw new Error('Email already registered. Please login instead.');
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'USER',
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateMockToken(newUser);
    const refreshToken = btoa(JSON.stringify({ userId: newUser.id, type: 'refresh' }));

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return { token, refreshToken };
  },

  refresh: async (refreshToken: string): Promise<{ token: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const decoded = JSON.parse(atob(refreshToken));
      const users = getStoredUsers();
      const user = users.find((u) => u.id === decoded.userId);

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      return { token: generateMockToken(user) };
    } catch {
      throw new Error('Invalid refresh token');
    }
  },

  getCurrentUser: () => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },
};
