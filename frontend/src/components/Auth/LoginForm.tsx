import { useState } from 'react'
import { Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { fetchJson } from '../../api/client'
import type { AuthLoginResponse, Role } from '../../types'

type LoginFormProps = {
  onLogin: (token: string, role: Role) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formUser = (form.elements.namedItem('username') as HTMLInputElement).value
    const formPass = (form.elements.namedItem('password') as HTMLInputElement).value
    setBusy(true)
    setError('')
    try {
      const res = await fetchJson<AuthLoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: formUser, password: formPass }),
      })
      localStorage.setItem('AegisAuthToken', res.access_token)
      onLogin(res.access_token, res.user.role)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-container p-8"
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-container/20 text-primary-container shadow-cyan">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-headline-lg font-bold text-primary">Aegis AI</h1>
          <p className="text-sm text-on-surface-variant">Система ИИ-видеомониторинга</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Имя пользователя
            </label>
            <input
              name="username"
              type="text"
              className="aegis-input w-full rounded-lg px-4 py-3"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="relative">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Пароль
            </label>
            <input
              name="password"
              type={showPwd ? 'text' : 'password'}
              className="aegis-input w-full rounded-lg px-4 py-3 pr-12"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-8 text-on-surface-variant"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-status-danger/10 p-3 text-sm text-status-danger">{error}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-primary-container py-3 text-[12px] font-bold uppercase tracking-widest text-on-primary-container shadow-cyan transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? 'Вход…' : 'Войти'}
        </button>
        <p className="mt-4 text-center text-xs text-on-surface-variant">
          Демо: admin / admin123
        </p>
      </form>
    </div>
  )
}
