export const API_URL = import.meta.env.VITE_API_URL || ''

export async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers)
  headers.set('Content-Type', 'application/json')
  const token = localStorage.getItem('AegisAuthToken')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json() as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      const text = await response.text()
      if (text) message = text
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}
