import { useEffect, useState } from 'react'
import { getConfig, updateConfig } from '../api.js'

// Key TShock settings to expose in the UI
const SETTING_GROUPS = [
  {
    group: 'Server',
    accent: 'cyan',
    fields: [
      { key: 'ServerName',          label: 'Server Name',            type: 'text',     desc: 'Name shown in server browser' },
      { key: 'ServerPassword',      label: 'Server Password',        type: 'password', desc: 'Leave empty for public' },
      { key: 'MaxSlots',            label: 'Max Player Slots',       type: 'number',   desc: 'Max simultaneous players' },
      { key: 'ServerPort',          label: 'Server Port',            type: 'number',   desc: 'Default: 7777' },
    ],
  },
  {
    group: 'Gameplay',
    accent: 'pink',
    fields: [
      { key: 'InfiniteInvasion',    label: 'Infinite Invasion',      type: 'bool',     desc: 'Invasions never end' },
      { key: 'PvPMode',             label: 'PvP Mode',               type: 'select',   options: ['normal', 'always', 'disabled'], desc: 'PvP enforcement' },
      { key: 'SpawnProtection',     label: 'Spawn Protection',       type: 'bool',     desc: 'Protect spawn area' },
      { key: 'SpawnProtectionRadius', label: 'Spawn Radius',         type: 'number',   desc: 'Tiles around spawn protected' },
    ],
  },
  {
    group: 'Anti-cheat / Limits',
    accent: 'cyan',
    fields: [
      { key: 'KickOnHardcoreDeath', label: 'Kick on Hardcore Death', type: 'bool',     desc: 'Kick HC players on death' },
      { key: 'RangeChecks',         label: 'Range Checks',           type: 'bool',     desc: 'Enforce tile interaction range' },
      { key: 'TileKillThreshold',   label: 'Tile Kill Threshold',    type: 'number',   desc: 'Max tile breaks/sec' },
      { key: 'TilePlaceThreshold',  label: 'Tile Place Threshold',   type: 'number',   desc: 'Max tile places/sec' },
      { key: 'ProjectileThreshold', label: 'Projectile Threshold',   type: 'number',   desc: 'Max projectiles/sec' },
    ],
  },
  {
    group: 'REST / API',
    accent: 'pink',
    fields: [
      { key: 'RestApiEnabled',      label: 'REST API Enabled',       type: 'bool',     desc: 'Enable TShock REST API' },
      { key: 'RestApiPort',         label: 'REST API Port',          type: 'number',   desc: 'Default: 7878' },
      { key: 'LogRest',             label: 'Log REST Calls',         type: 'bool',     desc: 'Log REST requests to console' },
    ],
  },
]

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative flex-shrink-0"
      style={{ width: 44, height: 24 }}
    >
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${checked ? '#00ffff' : '#2a2a4a'}`,
        boxShadow: checked ? '0 0 8px #00ffff44' : 'none',
        transition: 'all 0.2s',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: checked ? '#00ffff' : '#3a3a5a',
          boxShadow: checked ? '0 0 8px #00ffff' : 'none',
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          transition: 'all 0.2s',
        }} />
      </div>
    </button>
  )
}

function FieldRow({ field, value, onChange, onSave, saving, saved, accent }) {
  const accentColor = accent === 'pink' ? '#ff00aa' : '#00ffff'
  const [local, setLocal] = useState(value ?? '')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setLocal(value ?? '')
    setDirty(false)
  }, [value])

  function handleChange(v) {
    setLocal(v)
    setDirty(String(v) !== String(value ?? ''))
  }

  async function handleSave() {
    await onSave(field.key, local)
    setDirty(false)
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-cyber-border last:border-0
                    hover:bg-[rgba(255,255,255,0.02)] group transition-colors duration-150">
      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold tracking-wide" style={{ color: '#c0c8e0' }}>
          {field.label}
        </div>
        <div className="text-[10px] tracking-wider mt-0.5" style={{ color: '#3a3a5a' }}>
          {field.key}  {field.desc && `— ${field.desc}`}
        </div>
      </div>

      {/* Control */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {field.type === 'bool' ? (
          <Toggle
            checked={Boolean(local === true || local === 'true' || local === 1)}
            onChange={v => { handleChange(v); onSave(field.key, v) }}
          />
        ) : field.type === 'select' ? (
          <select
            value={local}
            onChange={e => handleChange(e.target.value)}
            className="cyber-input text-sm"
            style={{ width: 140, paddingRight: 8 }}
          >
            {field.options.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
            value={local}
            onChange={e => handleChange(e.target.value)}
            className="cyber-input text-sm"
            style={{ width: 180 }}
          />
        )}

        {/* Save button for text/number fields */}
        {field.type !== 'bool' && (
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="cyber-btn text-[10px] px-3 py-1.5 flex items-center gap-1 transition-all"
            style={{
              border: `1px solid ${dirty ? accentColor : '#2a2a4a'}`,
              color: dirty ? accentColor : '#3a3a5a',
              boxShadow: dirty ? `0 0 6px ${accentColor}44` : 'none',
              opacity: saving ? 0.6 : 1,
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
          >
            {saving ? '…' : saved ? '✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const [config, setConfig]           = useState({})
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [savingKey, setSavingKey]     = useState(null)
  const [savedKeys, setSavedKeys]     = useState({})

  useEffect(() => {
    async function load() {
      try {
        const data = await getConfig()
        setConfig(data?.config || data || {})
        setError(null)
      } catch (e) {
        setError(e.message)
        // Use empty config so fields are still editable
        setConfig({})
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave(key, value) {
    setSavingKey(key)
    try {
      await updateConfig(key, value)
      setConfig(prev => ({ ...prev, [key]: value }))
      setSavedKeys(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSavedKeys(prev => { const n = { ...prev }; delete n[key]; return n }), 2000)
    } catch (e) {
      // Show error inline via a toast-style approach
      alert(`Failed to save ${key}: ${e.message}`)
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[0.1em] uppercase"
              style={{ fontFamily: 'Orbitron, sans-serif', color: '#e0e0ff' }}>
            Server{' '}
            <span style={{ color: '#ff00aa', textShadow: '0 0 10px #ff00aa' }}>
              Settings
            </span>
          </h1>
          <div className="text-[10px] tracking-[0.3em] uppercase mt-1"
               style={{ color: '#3a3a5a' }}>
            Editing via TShock REST API — changes apply live
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="cyber-panel p-4 flex items-start gap-3"
             style={{ borderLeft: '2px solid #ff00aa44', boxShadow: '-4px 0 16px #ff00aa11' }}>
          <span style={{ color: '#ff00aa', fontSize: 18 }}>⚠</span>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase mb-1"
                 style={{ color: '#ff00aa' }}>
              Could not load config from API
            </div>
            <div className="text-xs" style={{ color: '#cc8899', fontFamily: 'JetBrains Mono, monospace' }}>
              {error}
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#665566' }}>
              Showing default fields. Save will attempt to write via REST even if read failed.
            </div>
          </div>
        </div>
      )}

      {/* Settings groups */}
      {SETTING_GROUPS.map(group => {
        const accentColor = group.accent === 'pink' ? '#ff00aa' : '#00ffff'
        return (
          <div key={group.group} className="cyber-panel overflow-hidden"
               style={{ border: `1px solid ${accentColor}22` }}>
            {/* Group header */}
            <div className="px-5 py-3 flex items-center gap-3 border-b border-cyber-border"
                 style={{ background: `linear-gradient(to right, ${accentColor}0a, transparent)` }}>
              <div className="w-0.5 h-5 rounded"
                   style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
              <h2 className="text-xs font-bold tracking-[0.35em] uppercase"
                  style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}88` }}>
                {group.group}
              </h2>
              <div className="flex-1 h-px"
                   style={{ background: `linear-gradient(to right, ${accentColor}22, transparent)` }} />
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {group.fields.map((_, i) => (
                  <div key={i} className="h-10 rounded animate-pulse"
                       style={{ background: '#0f0f1a' }} />
                ))}
              </div>
            ) : (
              group.fields.map(field => (
                <FieldRow
                  key={field.key}
                  field={field}
                  value={config[field.key]}
                  onChange={(k, v) => setConfig(prev => ({ ...prev, [k]: v }))}
                  onSave={handleSave}
                  saving={savingKey === field.key}
                  saved={!!savedKeys[field.key]}
                  accent={group.accent}
                />
              ))
            )}
          </div>
        )
      })}

      {/* Footer note */}
      <div className="text-center text-[10px] tracking-widest uppercase pb-4"
           style={{ color: '#2a2a4a', fontFamily: 'JetBrains Mono, monospace' }}>
        Settings are saved directly to the running TShock instance via REST API.
        <br />
        A server restart may be required for some changes to take effect.
      </div>
    </div>
  )
}
