# TShock Admin Panel

A cyberpunk-themed React SPA for managing a TShock (Terraria) server via its REST API.

## Stack

- **React 18** + **React Router 6**
- **Vite 5** dev server (port 17777)
- **Tailwind CSS 3** — dark cyberpunk design system
- **Bun** — package manager & script runner

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|---|---|
| `VITE_TSHOCK_API` | TShock REST base URL (e.g. `http://your-server:7878`) |
| `VITE_TSHOCK_TOKEN` | Auth token from TShock REST API |

### 3. Get a TShock auth token

```
GET http://<server>:7878/token/create/<username>/<password>
```

Copy the `token` field from the JSON response into your `.env`.

### 4. Run dev server

```bash
bun run dev
# → http://localhost:17777
```

### 5. Build for production

```bash
bun run build
bun run preview   # preview build on port 17777
```

## Pages

### Dashboard (`/`)
- Live server status (name, world, version, port)
- Online player count + player list with join/leave detection
- Auto-refreshes every 5s

### Console (`/console`)
- Terminal-style log viewer
- Polls TShock REST API every **2 seconds**
- Detects player joins/leaves and surfaces them as log lines
- Periodic heartbeat ticks
- Command input with **↑↓ history** navigation
- Sends commands via `GET /v3/server/rawcmd`

### Settings (`/settings`)
- Grouped settings editor (Server, Gameplay, Anti-cheat, REST)
- Reads current config via `GET /v2/server/config`
- Writes changes via `GET /v2/server/updateconfig`
- Toggle switches for booleans, dropdowns for enums, inputs for strings/numbers
- Inline dirty-state tracking with per-field save buttons

## TShock REST API endpoints used

| Method | Path | Purpose |
|---|---|---|
| GET | `/v2/server/status` | Server info, player count |
| GET | `/v2/players/list` | Player list |
| GET | `/v3/server/rawcmd?cmd=<cmd>&token=<token>` | Execute command |
| GET | `/v2/server/config` | Read config |
| GET | `/v2/server/updateconfig?key=<k>&value=<v>&token=<t>` | Write config |
| GET | `/token/create/<user>/<pass>` | Obtain auth token |

## CORS

If TShock REST is on a different origin you may need to configure CORS on the TShock side
or proxy through Vite's dev server. Add to `vite.config.js`:

```js
server: {
  proxy: {
    '/v2': 'http://localhost:7878',
    '/v3': 'http://localhost:7878',
    '/token': 'http://localhost:7878',
  }
}
```

Then set `VITE_TSHOCK_API=` (empty) so all API calls go through the dev proxy.
