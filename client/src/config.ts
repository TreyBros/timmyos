// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3333';
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
