# 🎮 Terraria TShock on Fly.io

Run a [TShock](https://github.com/Pryaxis/TShock) Terraria server on [Fly.io](https://fly.io) with a single persistent 5 GB volume that holds **config, plugins, worlds, and player data**.

## What persists

A Fly volume mounted at `/data` is symlinked into the three paths TShock expects:

| Mount path on volume | Symlinked to | Contents |
|---|---|---|
| `/data/tshock`  | `/tshock`  | `config.json`, `sscconfig.json`, `tshock.sqlite` (users/groups/permissions), `.tplr` SSC player data, logs, crashes |
| `/data/worlds`  | `/worlds`  | `*.wld`, `*.twld`, `*.bak` world files |
| `/data/plugins` | `/plugins` | Custom plugin `.dll` files |

Everything survives redeploys, restarts, and machine recreation.

## Quick Start

```bash
# 1. Install Fly CLI & sign in
curl -L https://fly.io/install.sh | sh
fly auth login

# 2. Clone & launch (uses fly.toml as-is, no wizard)
git clone https://github.com/nyatoru/terraria-flyio
cd terraria-flyio
fly launch --copy-config --no-deploy --name terraria-flyio

# 3. Allocate a public IPv4 (required — Terraria client can't use IPv6)
fly ips allocate-v4

# 4. Deploy (volume auto-created at 5 GB on first machine boot)
fly deploy
```

## Connect

Terraria client → **Multiplayer → Join via IP**
- **Address:** `<your-app>.fly.dev` (or the v4 IP from `fly ips list`)
- **Port:** `7777`

## First-Time TShock Setup

1. Join the server in-game
2. Get the setup code: `fly logs | grep setup-code`
3. In chat: `/setup <code>`
4. Create your admin: `/user add YourName password superadmin`
5. Lock it down: `/setup` (run again with no args to disable setup mode)

## Configuration

Set via `fly secrets` (overrides defaults in `Dockerfile`):

| Variable | Default | Description |
|---|---|---|
| `WORLD_SIZE` | `2` | `1`=small, `2`=medium, `3`=large |
| `WORLD_NAME` | `FlyWorld` | World name (also used as filename) |
| `MAX_PLAYERS` | `8` | Max concurrent players |
| `DIFFICULTY` | `0` | `0`=normal, `1`=expert, `2`=master, `3`=journey |
| `SERVER_PASS` | _(none)_ | Server join password |
| `SECURE` | `1` | TShock anti-cheat (`1`=on) |
| `SEED` | _(none)_ | World seed (only used on auto-create) |

```bash
fly secrets set WORLD_NAME=NyaWorld WORLD_SIZE=3 MAX_PLAYERS=16 SERVER_PASS=meow
```

## Adding Plugins

```bash
# Copy a .dll into the persistent /plugins dir on the running machine
fly ssh sftp shell
> put MyPlugin.dll /plugins/MyPlugin.dll
> exit
fly machines restart -a terraria-flyio
```

## Useful Commands

```bash
fly logs                         # live logs
fly status                       # machine + volume status
fly volume list                  # see the 5 GB volume
fly machines stop                # save cost (auto-stops when idle anyway)
fly machines start
fly ssh console                  # shell inside the running container
```

## Backup

```bash
# Save world in-game first (or wait for TShock's auto-save)
fly ssh console -C "ls -la /data/worlds"

# Pull the whole /data tree down
fly ssh sftp get /data ./backups/$(date +%F)
```

## License

MIT — TShock is licensed separately, see [Pryaxis/TShock COPYING](https://github.com/Pryaxis/TShock/blob/master/COPYING).
