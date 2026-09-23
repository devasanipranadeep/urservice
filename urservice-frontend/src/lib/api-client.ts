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

// In-flight GET request deduplication map: cacheKey -> Promise<T>
const inFlightRequests = new Map<string, Promise<any>>();

// In-memory response cache: cacheKey -> { data: any, expiresAt: number }
const responseCache = new Map<string, { data: any; expiresAt: number }>();

// TTL configurations (milliseconds)
const CACHE_TTL_RULES: Array<{ match: RegExp | string; ttlMs: number }> = [
  { match: '/api/profiles/me/photo-url', ttlMs: 60_000 },
  { match: '/api/profiles/me', ttlMs: 15_000 },
  { match: '/api/notifications/me/unread-count', ttlMs: 10_000 },
  { match: '/api/notifications/me', ttlMs: 8_000 },
];

function getCacheTtl(path: string): number {
  for (const rule of CACHE_TTL_RULES) {
    if (typeof rule.match === 'string' && path.includes(rule.match)) {
      return rule.ttlMs;
    } else if (rule.match instanceof RegExp && rule.match.test(path)) {
      return rule.ttlMs;
    }
  }
  return 4_000; // 4s default for other GET requests
}

function clearClientCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
    }
  }
}

async function executeRequest<T>(
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

async function request<T>(
  method: string,
  path: string,
  body?: any,
  options?: RequestInit & { noCache?: boolean }
): Promise<T> {
  const isGet = method.toUpperCase() === 'GET';

  // Mutations invalidate cached GET data to ensure freshness
  if (!isGet) {
    clearClientCache();
    return executeRequest<T>(method, path, body, options);
  }

  // Cache check for GET requests
  const cacheKey = `${method}:${path}`;
  const now = Date.now();

  if (!options?.noCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    // In-flight deduplication: return existing promise if identical request is already running
    const existingPromise = inFlightRequests.get(cacheKey);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }
  } else {
    // Clear stale cached response when a bypass is requested
    responseCache.delete(cacheKey);
  }

  // Execute request with in-flight tracking
  const requestPromise = executeRequest<T>(method, path, body, options)
    .then((result) => {
      const ttl = getCacheTtl(path);
      responseCache.set(cacheKey, { data: result, expiresAt: Date.now() + ttl });
      inFlightRequests.delete(cacheKey);
      return result;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  if (!options?.noCache) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit & { noCache?: boolean }) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body: any, options?: RequestInit) => request<T>('POST', path, body, options),
  put: <T>(path: string, body: any, options?: RequestInit) => request<T>('PUT', path, body, options),
  patch: <T>(path: string, body: any, options?: RequestInit) => request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestInit) => request<T>('DELETE', path, undefined, options),
  invalidateCache: (pattern?: string) => clearClientCache(pattern),
  clearCache: () => clearClientCache(),
};
