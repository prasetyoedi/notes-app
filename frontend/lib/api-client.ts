const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  status: 'Success' | 'Error';
  message: string;
  data: T;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }

  return data;
}


export async function fetchData<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await apiClient<T>(endpoint, options);
  return response.data;
}