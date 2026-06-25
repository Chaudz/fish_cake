const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Lỗi hệ thống' }));
    const msg = error.message;
    throw new Error(
      Array.isArray(msg) ? msg.join(', ') : msg || 'Lỗi hệ thống',
    );
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/pdf')) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

export async function downloadPdf(endpoint: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Không thể tải PDF');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
