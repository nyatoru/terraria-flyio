import { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/tshock/token/create/${encodeURIComponent(username)}/${encodeURIComponent(password)}`
      )
      const data = await res.json()
      if (data.status === '200' || data.status === 200) {
        const token = data.token
        if (!token) throw new Error('No token returned by server.')
        localStorage.setItem('tshock_token', token)
        onLogin()
      } else {
        setError(data.error || data.message || 'Login failed. Check your credentials.')
      }
    } catch (err) {
      setError(err.message || 'Network error — is TShock running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full relative"
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Corner ambient glows */}
      <div
        className="fixed top-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top left, #00ffff0a 0%, transparent 70%)' }}
      />
      <div
        className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom right, #ff00aa0a 0%, transparent 70%)' }}
      />

      {/* Login card */}
      <div
        className="cyber-panel relative w-full max-w-sm px-8 py-10 animate-slide-in z-10"
        style={{
          border: '1px solid #00ffff33',
          boxShadow: '0 0 40px #00ffff11, 0 0 80px #ff00aa08, 0 2px 48px #00000088',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(to right, transparent, #00ffff, #ff00aa, transparent)',
            boxShadow: '0 0 12px #00ffff88',
          }}
        />

        {/* Corner bracket — top-right */}
        <div
          className="absolute top-0 right-0 w-5 h-5 pointer-events-none"
          style={{ borderTop: '2px solid #ff00aa', borderRight: '2px solid #ff00aa' }}
        />
        {/* Corner bracket — bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-5 h-5 pointer-events-none"
          style={{ borderBottom: '2px solid #00ffff', borderLeft: '2px solid #00ffff' }}
        />

        {/* Logo / header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="text-4xl font-black tracking-wider"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                color: '#00ffff',
                textShadow: '0 0 14px #00ffff, 0 0 40px #00ffff88',
              }}
            >
              TS
            </div>
            <div
              className="text-xs font-bold tracking-[0.3em] uppercase"
              style={{ color: '#ff00aa', textShadow: '0 0 6px #ff00aa' }}
            >
              ▸
            </div>
          </div>
          <div
            className="text-sm font-bold tracking-[0.35em] uppercase"
            style={{ color: '#e0e0ff', fontFamily: 'Rajdhani, sans-serif' }}
          >
            TShock Admin
          </div>
          <div
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ color: '#ff00aa88', textShadow: '0 0 4px #ff00aa44' }}
          >
            Authentication Required
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: '#00ffff88' }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              className="cyber-input text-sm"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: '#00ffff88' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="cyber-input text-sm"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              className="cyber-panel px-4 py-3 flex items-start gap-2 animate-slide-in"
              style={{ borderLeft: '2px solid #ff00aa', boxShadow: '-3px 0 12px #ff00aa22' }}
            >
              <span style={{ color: '#ff00aa', fontSize: 14, lineHeight: 1.4 }}>⚠</span>
              <span
                className="text-xs leading-relaxed"
                style={{ color: '#cc7799', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="cyber-btn-cyan w-full mt-1 flex items-center justify-center gap-2"
            style={
              loading
                ? { opacity: 0.6, cursor: 'not-allowed' }
                : {}
            }
          >
            {loading ? (
              <>
                <span
                  className="inline-block w-3 h-3 border border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#00ffff', borderTopColor: 'transparent' }}
                />
                Authenticating…
              </>
            ) : (
              <>
                <span style={{ color: '#ff00aa', textShadow: '0 0 6px #ff00aa' }}>▶</span>
                Login
              </>
            )}
          </button>
        </form>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, #ff00aa44, transparent)' }}
        />
      </div>

      {/* Footer hint */}
      <div
        className="mt-6 text-[10px] tracking-[0.3em] uppercase z-10"
        style={{ color: '#2a2a3a' }}
      >
        TShock REST API
      </div>
    </div>
  )
}
