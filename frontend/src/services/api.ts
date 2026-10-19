const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, '') : '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('claimdesk_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('claimdesk_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('claimdesk_token');
  localStorage.removeItem('claimdesk_user');
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query;
    }
  }

  const token = getAuthToken();
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (response.status === 401) {
    // Unauthorized: token might be expired
    removeAuthToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
      if (errorJson.errors) {
        const fieldErrors = Object.values(errorJson.errors).join(', ');
        if (fieldErrors) errorMsg += `: ${fieldErrors}`;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  // Handle blob responses (e.g. file download)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/octet-stream') || contentType.includes('text/csv') || contentType.includes('application/vnd'))) {
    return response.blob() as unknown as T;
  }

  return response.json();
}
