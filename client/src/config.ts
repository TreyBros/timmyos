// API Configuration
// Use relative URLs for self-hosted mode (same origin)
export const API_URL = '';  // Empty = same origin
export const WS_URL = `ws://${window.location.host}`;
export const API_KEY = import.meta.env.VITE_API_KEY || 'timmy-dev-key';

// Headers for API requests
export const apiHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
};

// Fetch wrapper with API key
export async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...apiHeaders,
      ...options.headers
    }
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
