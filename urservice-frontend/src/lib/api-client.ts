import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  status: number;
  detail: string | any;

  constructor(status: number, detail: string | any) {
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail);
    super(message || `API Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: any,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;

  // Dynamically retrieve the current Supabase session to grab the JWT token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set default Content-Type unless it is FormData (which browser sets automatically with boundary)
  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorDetail: any = 'An unknown error occurred';
      try {
        const data = await response.json();
        errorDetail = data.detail || data;
      } catch {
        try {
          errorDetail = await response.text();
        } catch {}
      }
      throw new ApiError(response.status, errorDetail);
    }

    // Handle responses (JSON vs Empty/Text)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return {} as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const msg = (error as Error)?.message || 'Network request failed';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network request failed')) {
      throw new ApiError(0, 'Unable to connect to backend server. Please verify your connection or file sizes and try again.');
    }
    throw new ApiError(0, msg);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body: any, options?: RequestInit) => request<T>('POST', path, body, options),
  put: <T>(path: string, body: any, options?: RequestInit) => request<T>('PUT', path, body, options),
  patch: <T>(path: string, body: any, options?: RequestInit) => request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestInit) => request<T>('DELETE', path, undefined, options),
};
