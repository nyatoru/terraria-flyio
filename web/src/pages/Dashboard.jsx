import { useEffect, useState } from 'react'
import { getServerStatus, getPlayerList } from '../api.js'

function StatCard({ label, value, sub, accent = 'cyan' }) {
  const borderColor = accent === 'pink' ? '#ff00aa' : '#00ffff'
  const shadowColor = accent === 'pink' ? '#ff00aa' : '#00ffff'
  return (
    <div className="cyber-panel p-5 flex flex-col gap-2 relative"
         style={{
           borderLeft: `2px solid ${borderColor}`,
           boxShadow: `-4px 0 16px ${shadowColor}22, 0 0 1px ${shadowColor}33`,
         }}>
      {/* corner accents */}
      <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
           style={{
             borderTop: `1px solid ${borderColor}`,
             borderRight: `1px solid ${borderColor}`,
           }} />
      <div className="absolute bottom-0 left-8 right-0 h-px pointer-events-none"
           style={{ background: `linear-gradient(to right, ${borderColor}44, transparent)` }} />

      <div className="text-[10px] font-bold tracking-[0.35em] uppercase"
           style={{ color: `${borderColor}88` }}>
        {label}
      </div>
      <div className="text-3xl font-black tracking-wide"
           style={{
             fontFamily: 'Orbitron, monospace',
             color: borderColor,
             textShadow: `0 0 10px ${borderColor}, 0 0 30px ${borderColor}66`,
           }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div className="text-xs tracking-wider"
             style={{ color: '#6688aa', fontFamily: 'JetBrains Mono, monospace' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function PlayerRow({ player, index }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-cyber-border last:border-0 group hover:bg-[rgba(0,255,255,0.03)] transition-colors duration-150 animate-slide-in"
         style={{ animationDelay: `${index * 60}ms` }}>
      <div className="online-dot flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold tracking-wide text-sm truncate"
             style={{ color: '#e0e0ff' }}>
          {player.nickname || player.username}
        </div>
        {player.group && (
          <div className="text-[10px] tracking-widest uppercase"
               style={{ color: '#ff00aa88' }}>
            {player.group}
          </div>
        )}
      </div>
      <div className="text-[10px] font-mono text-right flex-shrink-0"
           style={{ color: '#4488aa' }}>
        <div>{player.ip || ''}</div>
        {player.difficulty !== undefined && (
          <div style={{ color: '#6644aa' }}>❤ {player.difficulty}</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const online = status === 'online'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0"
           style={{
             width: 10, height: 10, borderRadius: '50%',
             background: online ? '#00ffff' : '#ff00aa',
             boxShadow: online ? '0 0 8px #00ffff, 0 0 16px #00ffff88' : '0 0 8px #ff00aa, 0 0 16px #ff00aa88',
           }} />
      <span className="text-xs font-bold tracking-[0.3em] uppercase"
            style={{ color: online ? '#00ffff' : '#ff00aa' }}>
        {online ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  )
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-px h-5"
             style={{ background: 'linear-gradient(to bottom, #00ffff, transparent)' }} />
        <h2 className="text-xs font-bold tracking-[0.35em] uppercase"
            style={{ color: '#00ffff', textShadow: '0 0 8px #00ffff88' }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

export default function Dashboard() {
  const [status, setStatus]   = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function refresh() {
    try {
      const [s, p] = await Promise.all([getServerStatus(), getPlayerList()])
      setStatus(s)
      setPlayers(p.players || [])
      setError(null)
      setLastUpdate(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [])

  const serverOnline = !error && status?.status === 200

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[0.1em] uppercase"
              style={{ fontFamily: 'Orbitron, sans-serif', color: '#e0e0ff' }}>
            Server{' '}
            <span style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff' }}>
              Dashboard
            </span>
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <StatusBadge status={serverOnline ? 'online' : 'offline'} />
            {lastUpdate && (
              <span className="text-[10px] tracking-widest"
                    style={{ color: '#3a3a5a', fontFamily: 'JetBrains Mono, monospace' }}>
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          className="cyber-btn-cyan text-xs px-3 py-2"
          title="Refresh"
        >
          ↺ Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="cyber-panel p-4 flex items-start gap-3"
             style={{ borderLeft: '2px solid #ff00aa', boxShadow: '-4px 0 16px #ff00aa22' }}>
          <span style={{ color: '#ff00aa', fontSize: 18 }}>⚠</span>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-1"
                 style={{ color: '#ff00aa' }}>
              API Error
            </div>
            <div className="text-sm" style={{ color: '#cc8899', fontFamily: 'JetBrains Mono, monospace' }}>
              {error}
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#665566' }}>
              Check that TShock is running and VITE_TSHOCK_API / VITE_TSHOCK_TOKEN are set correctly.
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Players Online"
          value={loading ? '…' : (status?.playercount ?? players.length ?? 0)}
          sub={`/ ${status?.maxplayers ?? '?'} max`}
        />
        <StatCard
          label="World"
          value={loading ? '…' : (status?.world ?? '—')}
          accent="pink"
        />
        <StatCard
          label="Version"
          value={loading ? '…' : (status?.version ?? '—')}
          sub="TShock"
        />
        <StatCard
          label="Port"
          value={loading ? '…' : (status?.port ?? '—')}
          accent="pink"
          sub="server port"
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players list */}
        <div className="lg:col-span-2 cyber-panel overflow-hidden"
             style={{ border: '1px solid #00ffff22' }}>
          <div className="px-4 pt-4 pb-0">
            <SectionHeader
              title={`Active Players  (${players.length})`}
              action={
                <span className="text-[10px] tracking-widest"
                      style={{ color: '#3a3a5a', fontFamily: 'JetBrains Mono, monospace' }}>
                  auto-refresh 5s
                </span>
              }
            />
          </div>

          {loading ? (
            <div className="px-4 pb-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded animate-pulse"
                     style={{ background: '#0f0f1a' }} />
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="px-4 pb-8 text-center mt-4">
              <div className="text-4xl mb-2" style={{ opacity: 0.3 }}>⬡</div>
              <div className="text-xs tracking-widest uppercase"
                   style={{ color: '#3a3a5a' }}>
                No players online
              </div>
            </div>
          ) : (
            <div>
              {players.map((p, i) => (
                <PlayerRow key={p.username || i} player={p} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Server info panel */}
        <div className="cyber-panel overflow-hidden"
             style={{ border: '1px solid #ff00aa22' }}>
          <div className="px-4 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-px h-5"
                   style={{ background: 'linear-gradient(to bottom, #ff00aa, transparent)' }} />
              <h2 className="text-xs font-bold tracking-[0.35em] uppercase"
                  style={{ color: '#ff00aa', textShadow: '0 0 8px #ff00aa88' }}>
                Server Info
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="px-4 pb-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 rounded animate-pulse"
                     style={{ background: '#0f0f1a' }} />
              ))}
            </div>
          ) : status ? (
            <div className="divide-y divide-cyber-border">
              {[
                { k: 'Server Name',  v: status.name },
                { k: 'World Name',   v: status.world },
                { k: 'Version',      v: status.version },
                { k: 'Port',         v: status.port },
                { k: 'Players',      v: `${status.playercount} / ${status.maxplayers}` },
                { k: 'Mods',         v: status.mods?.length ?? 0 },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between items-center px-4 py-3 hover:bg-[rgba(255,0,170,0.03)] transition-colors">
                  <span className="text-[10px] tracking-widest uppercase"
                        style={{ color: '#6644aa' }}>
                    {k}
                  </span>
                  <span className="text-xs font-semibold text-right max-w-[60%] truncate"
                        style={{ color: '#e0e0ff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {v ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 pb-8 text-center mt-4">
              <div className="text-xs tracking-widest uppercase"
                   style={{ color: '#3a3a5a' }}>
                No data
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
