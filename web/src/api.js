/**
 * TShock REST API helper
 * All calls attach the auth token from .env
 */

const BASE = '/tshock'
const TOKEN = import.meta.env.VITE_TSHOCK_TOKEN || ''

function url(path, params = {}) {
  const u = new URL(window.location.origin + BASE + path)
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v))
  return u.toString()
}

async function get(path, params = {}) {
  const res = await fetch(url(path, params))
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

// ── Server ────────────────────────────────────────────────────────────────────
export async function getServerStatus() {
  return get('/v2/server/status', { token: TOKEN })
}

// ── Players ───────────────────────────────────────────────────────────────────
export async function getPlayerList() {
  return get('/v2/players/list', { token: TOKEN })
}

// ── Commands ──────────────────────────────────────────────────────────────────
export async function sendCommand(cmd) {
  return get('/v3/server/rawcmd', { cmd, token: TOKEN })
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function createToken(username, password) {
  return get(`/token/create/${encodeURIComponent(username)}/${encodeURIComponent(password)}`)
}

// ── Config ────────────────────────────────────────────────────────────────────
export async function getConfig() {
  return get('/v2/server/config', { token: TOKEN })
}

export async function updateConfig(key, value) {
  return get('/v2/server/updateconfig', { token: TOKEN, key, value })
}
