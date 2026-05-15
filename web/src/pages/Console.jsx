import { useEffect, useRef, useState, useCallback } from 'react'
import { sendCommand, getServerStatus } from '../api.js'

// Colorise log lines based on prefix keywords
function colorizeLog(text) {
  if (!text) return { color: '#8899bb', text }
  const t = text.toLowerCase()
  if (t.includes('[error]') || t.includes('error:') || t.includes('exception'))
    return { color: '#ff4466', glow: '#ff446644', text }
  if (t.includes('[warn]') || t.includes('warning'))
    return { color: '#ffaa00', glow: '#ffaa0044', text }
  if (t.includes('[info]') || t.includes('server started') || t.includes('listening'))
    return { color: '#00ffff', glow: '#00ffff22', text }
  if (t.includes('joined') || t.includes('connected'))
    return { color: '#00ff88', glow: '#00ff8822', text }
  if (t.includes('left') || t.includes('disconnected'))
    return { color: '#ff8844', glow: '#ff884422', text }
  if (t.includes('[tshock]'))
    return { color: '#ff00aa', glow: '#ff00aa22', text }
  if (t.startsWith('>'))
    return { color: '#ffffaa', glow: '#ffffaa11', text }
  return { color: '#8899bb', text }
}

function LogLine({ line, index }) {
  const { color, glow, text } = colorizeLog(line.text)
  return (
    <div className="flex gap-3 px-4 py-0.5 group hover:bg-[rgba(255,255,255,0.02)] text-xs leading-5"
         style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}>
      <span className="flex-shrink-0 select-none"
            style={{ color: '#2a2a4a', fontFamily: 'JetBrains Mono, monospace', minWidth: 90 }}>
        {line.ts}
      </span>
      <span style={{
        color,
        textShadow: glow ? `0 0 8px ${glow}` : 'none',
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}>
        {text}
      </span>
    </div>
  )
}

// Simulated log lines from server status (real log endpoint depends on TShock plugin)
function buildLogFromStatus(status, prev) {
  const ts = new Date().toLocaleTimeString([], { hour12: false })
  const lines = [...(prev || [])]

  if (!status) {
    lines.push({ id: Date.now(), ts, text: '[ERROR] Could not reach TShock API' })
    return lines.slice(-500)
  }

  // Diff player list to synthesise join/leave events
  return lines.slice(-500)
}

export default function Console() {
  const [logs, setLogs]           = useState([
    { id: 0, ts: '--:--:--', text: '[INFO]  TShock Admin Console ready. Polling every 2s.' },
  ])
  const [cmd, setCmd]             = useState('')
  const [history, setHistory]     = useState([])
  const [histIdx, setHistIdx]     = useState(-1)
  const [sending, setSending]     = useState(false)
  const [error, setError]         = useState(null)
  const [cmdLog, setCmdLog]       = useState([])
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)
  const prevPlayersRef            = useRef([])
  const pollCountRef              = useRef(0)

  const addLog = useCallback((text) => {
    const ts = new Date().toLocaleTimeString([], { hour12: false })
    setLogs(prev => [...prev.slice(-500), { id: Date.now() + Math.random(), ts, text }])
  }, [])

  // Poll server status every 2s to detect player changes
  useEffect(() => {
    async function poll() {
      try {
        const s = await getServerStatus()
        setError(null)
        pollCountRef.current++

        const nowPlayers = s.players || []
        const prevNames  = new Set(prevPlayersRef.current.map(p => p.nickname || p.username))
        const nowNames   = new Set(nowPlayers.map(p => p.nickname || p.username))

        // Join/leave events
        for (const name of nowNames) {
          if (!prevNames.has(name)) addLog(`[INFO]  ${name} has joined the server.`)
        }
        for (const name of prevNames) {
          if (!nowNames.has(name)) addLog(`[INFO]  ${name} has left the server.`)
        }

        prevPlayersRef.current = nowPlayers

        // Heartbeat every 30 polls (60s)
        if (pollCountRef.current % 30 === 0) {
          addLog(`[TICK]  Server heartbeat — players: ${s.playercount}/${s.maxplayers}  world: ${s.world}`)
        }
      } catch (e) {
        setError(e.message)
        addLog(`[ERROR] API unreachable: ${e.message}`)
      }
    }

    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [addLog])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = cmd.trim()
    if (!trimmed) return

    const ts = new Date().toLocaleTimeString([], { hour12: false })
    addLog(`> ${trimmed}`)
    setHistory(h => [trimmed, ...h.slice(0, 49)])
    setHistIdx(-1)
    setCmd('')
    setSending(true)

    try {
      const res = await sendCommand(trimmed)
      if (res?.response) {
        res.response.split('\n').forEach(line => {
          if (line.trim()) addLog(`  ${line}`)
        })
      } else {
        addLog(`[OK]    Command executed.`)
      }
    } catch (e) {
      addLog(`[ERROR] Failed to send command: ${e.message}`)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, history.length - 1)
        setCmd(history[next] || '')
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setCmd(next === -1 ? '' : (history[next] || ''))
        return next
      })
    }
  }

  function clearLogs() {
    setLogs([{ id: Date.now(), ts: new Date().toLocaleTimeString([], { hour12: false }), text: '[INFO]  Console cleared.' }])
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-[0.1em] uppercase"
              style={{ fontFamily: 'Orbitron, sans-serif', color: '#e0e0ff' }}>
            Server{' '}
            <span style={{ color: '#00ffff', textShadow: '0 0 10px #00ffff' }}>
              Console
            </span>
          </h1>
          <div className="text-[10px] tracking-[0.3em] uppercase mt-1"
               style={{ color: '#3a3a5a' }}>
            Live output · polling every 2s · {logs.length} lines
          </div>
        </div>
        <div className="flex gap-2">
          {error && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs"
                 style={{ border: '1px solid #ff00aa44', color: '#ff00aa', background: '#ff00aa08',
                          fontFamily: 'JetBrains Mono, monospace' }}>
              ⚠ API Error
            </div>
          )}
          <button onClick={clearLogs} className="cyber-btn-pink text-xs px-3 py-2">
            ✕ Clear
          </button>
        </div>
      </div>

      {/* Log output */}
      <div className="flex-1 cyber-panel overflow-hidden flex flex-col min-h-0"
           style={{ border: '1px solid #00ffff22' }}>
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-cyber-border flex-shrink-0"
             style={{ background: '#0a0a10' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff4444', boxShadow: '0 0 4px #ff4444' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffaa00', boxShadow: '0 0 4px #ffaa00' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }} />
          <span className="ml-2 text-[10px] tracking-[0.3em] uppercase"
                style={{ color: '#2a2a4a', fontFamily: 'JetBrains Mono, monospace' }}>
            tshock-console — bash
          </span>
          <div className="flex-1" />
          <div className="online-dot" />
        </div>

        {/* Scrollable log area */}
        <div className="flex-1 overflow-y-auto py-2 min-h-0"
             style={{ background: '#05050d' }}>
          {logs.map((line, i) => (
            <LogLine key={line.id} line={line} index={i} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Command input */}
      <div className="flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-3 items-stretch">
          <div className="flex items-center gap-2 px-3 flex-shrink-0"
               style={{
                 border: '1px solid #00ffff33',
                 background: '#05050d',
                 color: '#00ffff',
                 textShadow: '0 0 6px #00ffff',
                 fontFamily: 'JetBrains Mono, monospace',
                 fontSize: 14,
               }}>
            &gt;_
          </div>
          <input
            ref={inputRef}
            type="text"
            className="cyber-input flex-1 text-sm"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
            placeholder="Enter server command… (↑↓ history)"
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            disabled={sending}
          />
          <button
            type="submit"
            className="cyber-btn-cyan px-6 flex-shrink-0 flex items-center gap-2"
            disabled={sending || !cmd.trim()}
            style={{ opacity: (!cmd.trim() || sending) ? 0.5 : 1 }}
          >
            {sending ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                <span>Send</span>
                <span style={{ fontSize: 12 }}>▶</span>
              </>
            )}
          </button>
        </form>
        <div className="mt-1.5 flex gap-4 text-[10px] tracking-wider"
             style={{ color: '#2a2a4a', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>↑↓ history ({history.length})</span>
          <span>Enter to send</span>
          <span>Common: /say /ban /kick /tp /time /broadcast</span>
        </div>
      </div>
    </div>
  )
}
