import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'job_portal_token';
const REFRESH_TOKEN_KEY = 'job_portal_refresh_token';

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getUser = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded || isTokenExpired(token)) {
    return null;
  }
  
  return decoded;
};

export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

export const getUserEmail = (): string | null => {
  const user = getUser();
  return user?.email || null;
};

export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'ADMIN' || role === 'admin';
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

export const logout = (): void => {
  removeTokens();
  window.location.href = '/login';
};
