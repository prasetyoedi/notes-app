// lib/auth.ts
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

export function getUser(): { id: number; email: string } | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setTokenCookie(token: string) {
  if (typeof window === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function removeTokenCookie() {
  if (typeof window === 'undefined') return;
  document.cookie = 'token=; path=/; max-age=0';
}


export function setUser(user: { id: number; email: string }): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  console.log('🔐 isAuthenticated - token:', token ? '✅ ada' : '❌ tidak ada');
  return !!token;
}

export function logout(): void {
  removeToken();
  removeUser();
  removeTokenCookie(); 
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}