/**
 * API client utilities for TradoEasy frontend.
 * Automatically resolves backend base URL (local dev or ngrok tunnel on Vercel)
 * and attaches necessary headers like 'ngrok-skip-browser-warning'.
 */

export const DEFAULT_BACKEND_URL = 'https://unstopped-anthem-bullfrog.ngrok-free.dev';

export function getBackendBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  const saved = localStorage.getItem('tradoeasy_backend_url');
  if (saved && saved.trim()) {
    return saved.trim().replace(/\/+$/, '');
  }

  // If running on Vercel or any external domain other than localhost, default to the public ngrok tunnel
  if (
    window.location.hostname.includes('vercel.app') ||
    (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ) {
    return DEFAULT_BACKEND_URL;
  }

  // Local development
  return '';
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = getBackendBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${base}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('ngrok-skip-browser-warning')) {
    headers.set('ngrok-skip-browser-warning', 'true');
  }

  return fetch(fullUrl, {
    ...options,
    headers,
  });
}
