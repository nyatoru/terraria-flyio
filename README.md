# 🎮 Terraria TShock on Fly.io

Run a [TShock](https://github.com/Pryaxis/TShock) Terraria server on [Fly.io](https://fly.io) with persistent world storage.

## Features

- TShock 6.1 (Terraria 1.4.5.6) with anti-cheat, permissions, plugins
- Persistent 5GB volume for world data
- Auto-create world on first deploy
- Public IP on port 7777
- Auto-stop when no players connected (saves cost)

## Quick Start

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Launch
```bash
fly launch --copy-config --no-deploy
fly volume create terraria_world --region sin --size 5
fly deploy
```

### 3. Connect
Open Terraria → Multiplayer → Join via IP:
- **Address:** `terraria-flyio.fly.dev`
- **Port:** `7777`

## First-Time Setup

1. Join the server in-game
2. Check logs for setup code: `fly logs | grep setup-code`
3. Run `/setup <code>` in chat
4. Register as admin: `/user add YourName password superadmin`

## Configuration

Environment variables in `fly.toml` or `fly secrets`:

| Variable | Default | Description |
|----------|---------|-------------|
| `WORLD_SIZE` | `2` | 1=small, 2=medium, 3=large |
| `WORLD_NAME` | `FlyWorld` | World name |
| `MAX_PLAYERS` | `8` | Max concurrent players |
| `DIFFICULTY` | `0` | 0=normal, 1=expert, 2=master, 3=journey |
| `SERVER_PASS` | _(none)_ | Server password |
| `SECURE` | `1` | Anti-cheat (1=on, 0=off) |

Example:
```bash
fly secrets set WORLD_SIZE=3 WORLD_NAME="MyWorld" MAX_PLAYERS=16
```

## Useful Commands

```bash
# View logs
fly logs

# Attach to server console
fly ssh console -C "cat /proc/1/fd/1"

# Restart server
fly machines restart -a terraria-flyio

# Scale to zero (stop)
fly machines stop -a terraria-flyio

# Delete and recreate volume
fly volume destroy <vol_id> -a terraria-flyio
```

## Managing via TShock REST API

The REST API runs on port 7878 (internal only). To access:
```bash
fly ssh console -C "curl -s http://localhost:7878/v2/server/status?token=YOUR_TOKEN"
```

Create a token first by joining the server and running `/rest createtoken`.

## Backup

World files are on the Fly volume at `/world/`. To backup:
```bash
# Save world in-game first
fly ssh console -C "echo 'save' > /proc/1/fd/0"

# Copy world files locally
fly ssh sftp get /world/*.wld ./backups/
```

## License

MIT — TShock itself is under a custom license, see [Pryaxis/TShock](https://github.com/Pryaxis/TShock/blob/main/COPYING).
