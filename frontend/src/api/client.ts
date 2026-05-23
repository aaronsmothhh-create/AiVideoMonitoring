export const API_URL = import.meta.env.VITE_API_URL || window.location.origin

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('AegisAuthToken')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `HTTP ${response.status}`)
  }
  return (await response.json()) as T
}
