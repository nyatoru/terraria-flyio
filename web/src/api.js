/**
 * TShock REST API helper
 * Auth token is read live from localStorage on every call.
 */

const BASE = '/tshock'

function getToken() {
  return localStorage.getItem('tshock_token') || ''
}

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
  return get('/v2/server/status', { token: getToken() })
}

// ── Players ───────────────────────────────────────────────────────────────────
export async function getPlayerList() {
  return get('/v2/players/list', { token: getToken() })
}

// ── Commands ──────────────────────────────────────────────────────────────────
export async function sendCommand(cmd) {
  return get('/v3/server/rawcmd', { cmd, token: getToken() })
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function createToken(username, password) {
  return get(`/token/create/${encodeURIComponent(username)}/${encodeURIComponent(password)}`)
}

// ── Config ────────────────────────────────────────────────────────────────────
export async function getConfig() {
  return get('/v2/server/config', { token: getToken() })
}

export async function updateConfig(key, value) {
  return get('/v2/server/updateconfig', { token: getToken(), key, value })
}
