import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Console from './pages/Console.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', icon: '⬡' },
  { to: '/console',  label: 'Console',   icon: '⌘' },
  { to: '/settings', label: 'Settings',  icon: '⚙' },
]

function NavBar({ onLogout }) {
  const location = useLocation()

  return (
    <nav className="flex-shrink-0 w-full flex items-stretch bg-cyber-panel border-b border-cyber-border relative z-20"
         style={{ boxShadow: '0 1px 0 #00ffff22, 0 4px 20px #000a' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 border-r border-cyber-border min-w-[200px]">
        <div className="relative">
          <div className="text-2xl font-black tracking-wider"
               style={{ fontFamily: 'Orbitron, sans-serif', color: '#00ffff',
                        textShadow: '0 0 10px #00ffff, 0 0 30px #00ffff88' }}>
            TS
          </div>
          <div className="absolute -bottom-1 -right-1 text-xs"
               style={{ color: '#ff00aa', textShadow: '0 0 6px #ff00aa' }}>▸</div>
        </div>
        <div>
          <div className="text-xs font-bold tracking-[0.2em] uppercase"
               style={{ color: '#e0e0ff', fontFamily: 'Rajdhani, sans-serif' }}>TShock</div>
          <div className="text-[10px] tracking-[0.3em] uppercase"
               style={{ color: '#ff00aa', textShadow: '0 0 4px #ff00aa88' }}>Admin Panel</div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-stretch flex-1">
        {NAV_ITEMS.map(item => {
          const active = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-6 text-sm font-semibold tracking-widest uppercase transition-all duration-200 relative border-r border-cyber-border
                ${active
                  ? 'text-neon-cyan bg-[rgba(0,255,255,0.05)]'
                  : 'text-[#6688aa] hover:text-[#99ccdd] hover:bg-[rgba(0,255,255,0.03)]'
                }`}
              style={active ? { textShadow: '0 0 8px #00ffff88' } : {}}
            >
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: '#00ffff', boxShadow: '0 0 8px #00ffff, 0 0 16px #00ffff88' }} />
              )}
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </div>

      {/* Right side: status indicator + logout */}
      <div className="flex items-center gap-4 px-6 border-l border-cyber-border">
        <div className="flex items-center gap-2">
          <div className="online-dot" />
          <span className="text-xs tracking-widest uppercase"
                style={{ color: '#00ffff88', fontFamily: 'JetBrains Mono, monospace' }}>
            LIVE
          </span>
        </div>

        <button
          onClick={onLogout}
          className="cyber-btn-pink text-[10px] px-3 py-1.5 tracking-widest uppercase"
          title="Logout"
        >
          ⏻ Logout
        </button>
      </div>
    </nav>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('tshock_token'))

  function handleLogin() {
    setAuthed(true)
  }

  function handleLogout() {
    localStorage.removeItem('tshock_token')
    setAuthed(false)
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#0a0a0f' }}>
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-50"
           style={{
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
             backgroundSize: '100% 4px',
           }} />

      <NavBar onLogout={handleLogout} />

      <main className="flex-1 overflow-auto relative">
        {/* Corner glow effects */}
        <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none"
             style={{ background: 'radial-gradient(circle at top left, #00ffff08 0%, transparent 70%)' }} />
        <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none"
             style={{ background: 'radial-gradient(circle at bottom right, #ff00aa08 0%, transparent 70%)' }} />

        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/console"  element={<Console />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
