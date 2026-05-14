# 🎮 Terraria TShock on Fly.io

Run a [TShock](https://github.com/Pryaxis/TShock) Terraria server on [Fly.io](https://fly.io) — preconfigured for a **Large × Master × "For the Worthy"** world on a 4 GB / 2 vCPU machine with a persistent 5 GB volume.

## Defaults baked into this repo

| | Setting |
|---|---|
| 🌍 World size | **Large** |
| 💀 Difficulty | **Master** |
| 🌱 Seed | `for the worthy` (FTW secret seed) |
| 📛 World name | `ForTheWorthy` |
| 👥 Max players | `8` |
| 🛡️ Anti-cheat | on |
| 🖥️ VM | `performance-2x` (2 dedicated vCPU, 4 GB RAM) |
| 💾 Volume | 5 GB at `/data`, auto-extend to 20 GB, daily snapshots (5-day retention) |
| 🌏 Region | `sin` (Singapore) |
| 🔌 Port | `7777/tcp` |

Change any of these via `fly secrets set ...` (see [Configuration](#configuration)).

## What persists

> ⚠️ Fly machines have **ephemeral filesystems** — only the volume at `/data` survives restarts, redeploys, and machine recreation.

Everything TShock writes is redirected to `/data`:

| Persistent path on volume | Symlinked/redirected to | Contents |
|---|---|---|
| `/data/tshock`        | `/tshock`                       | `config.json`, `sscconfig.json`, `tshock.sqlite` (users/groups/permissions), `.tplr` SSC player data, logs, crashes |
| `/data/worlds`        | `/worlds`                       | `*.wld`, `*.twld`, `*.bak` world files + auto-save backups (`-savedirectory`) |
| `/data/plugins`       | `/plugins`                      | Custom plugin `.dll` files |
| `/data/terraria-home` | `$HOME` (`~/.local/share/...`)  | Catch-all for any XDG-style writes Terraria attempts |

## First-Run Deploy

### 1. Install Fly CLI and sign in

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 2. Clone and create the app (no deploy yet)

```bash
git clone https://github.com/nyatoru/terraria-flyio
cd terraria-flyio
fly launch --copy-config --no-deploy --name terraria-flyio --region sin
```

`--copy-config` tells Fly to use the bundled `fly.toml` as-is. `--no-deploy` stops it from building before the volume exists.

### 3. Create the 5 GB persistent volume

```bash
fly volume create terraria_data \
  --region sin \
  --size 5 \
  --snapshot-retention 5 \
  --yes
```

The volume name **must be `terraria_data`** — that's what `fly.toml` mounts.

### 4. Allocate a public IPv4

```bash
fly ips allocate-v4
```

Terraria's client can't connect over IPv6, so a v4 address is required.

### 5. (Optional) Override world defaults

If you want anything other than Large/Master/FTW, set it **before** the first deploy — the world is auto-created on first boot and overrides do nothing afterward:

```bash
fly secrets set WORLD_NAME=MyWorld WORLD_SIZE=2 DIFFICULTY=1 SEED="" SERVER_PASS=meow
```

### 6. Deploy

```bash
fly deploy
```

First boot takes **2–4 minutes** while the Large × Master world generates. Watch progress:

```bash
fly logs
```

You'll see messages like `Generating world: 47%` and finally `Server started`.

### 7. Connect from Terraria

In-game → **Multiplayer → Join via IP**:

- **Address:** the IP from `fly ips list` (or `terraria-flyio.fly.dev`)
- **Port:** `7777`
- **Password:** whatever you set in `SERVER_PASS` (none by default)

### 8. Claim the server (TShock setup)

The first connecting player must claim admin rights:

```bash
# Grab the one-time setup code from logs
fly logs | grep -i 'setup code'
```

Then in the in-game chat:

```
/setup <code>
/user add YourName YourPassword superadmin
/login YourName YourPassword
/setup            # run again to disable setup mode — IMPORTANT
```

🔒 Don't skip the last `/setup` or anyone joining can grab admin.

## Configuration

Override any default with `fly secrets`. Changes take effect after `fly machines restart`.

| Variable | Default | Description |
|---|---|---|
| `WORLD_SIZE`  | `3` | `1`=small, `2`=medium, `3`=large |
| `WORLD_NAME`  | `ForTheWorthy` | Used as filename + in-game name |
| `DIFFICULTY`  | `2` | `0`=normal, `1`=expert, `2`=master, `3`=journey |
| `SEED`        | `for the worthy` | Only applied when auto-creating a new world |
| `MAX_PLAYERS` | `8` | Max concurrent players |
| `SERVER_PASS` | _(none)_ | Server join password |
| `SECURE`      | `1` | TShock anti-cheat (`1`=on) |

> ⚠️ `WORLD_SIZE`, `WORLD_NAME`, `DIFFICULTY`, and `SEED` only apply on the **first deploy** when no `.wld` exists yet. To regenerate, delete the existing world from the volume first (`fly ssh console -C "rm /data/worlds/*.wld"`).

## Editing config.json

Three ways to tweak `config.json` after deploy:

### 🥇 Recommended: edit locally via sftp (gives you git history)

```bash
# 1. Pull the live config
fly ssh sftp get /data/tshock/config.json ./config.json

# 2. Edit in your favorite editor — commit to git for history
code config.json
git add config.json && git commit -m "config: tune spawn rate"

# 3. Push back
fly ssh sftp shell <<'EOF'
put config.json /data/tshock/config.json
EOF

# 4. Apply — pick one:
# In-game chat:  /reload         ← no downtime, players stay connected
# OR:            fly machines restart -a terraria-flyio
```

Why this wins: your editor handles JSON validation, you have undo, and git history protects you from typos that brick the server.

### 🥈 Quick & dirty: edit in-place via SSH (nano/vim pre-installed)

```bash
fly ssh console
nano /tshock/config.json
# Sanity-check before saving:
cat /tshock/config.json | jq . > /dev/null && echo OK || echo "BROKEN JSON"
exit

# In-game:  /reload    — or restart the machine
```

> ⚠️ A typo here breaks the file → server fails to boot. Always pipe through `jq` to validate.

### 🥉 Live tweaks: TShock slash commands (no SSH needed)

Most settings have in-game equivalents — apply instantly without touching files:

```
/maxspawns 5
/spawnrate 10
/save             # save world
/reload           # reload config.json from disk
```

### Commonly tweaked keys in `config.json`

```jsonc
{
  "Settings": {
    "ServerName": "Toru's Terraria",
    "ServerPort": 7777,
    "MaxSlots": 8,
    "MotdMessages": ["Welcome to the server!"],
    "DisableHardmode": false,
    "DisableDungeonGuardian": false,
    "RestApiEnabled": true,
    "RestApiPort": 7878,
    "AnnounceSave": true,
    "BackupInterval": 10,
    "BackupKeepFor": 60
  }
}
```

Full list: [TShock config docs](https://tshock.readme.io/docs/config-settings).

## Adding Plugins

```bash
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

Fly takes daily snapshots automatically (kept 5 days). Manual options:

```bash
# List & create snapshots
fly volume list
fly volume snapshots list <vol_id>
fly volume snapshots create <vol_id>

# Save world in-game first, then pull everything down
fly ssh sftp get /data ./backups/$(date +%F)

# Restore from snapshot (creates new volume; reattach via fly.toml)
fly volume snapshots list <vol_id>
fly volume create terraria_data --snapshot-id <snap_id> --region sin
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Can't reach server` from Terraria client | Run `fly ips list` — make sure there's a v4 entry. If not, `fly ips allocate-v4`. |
| First deploy fails with `volume not found` | Volume name in `fly volume create` must be `terraria_data` (matches `[[mounts]].source` in `fly.toml`). |
| Logs show `world too big` or OOM | Bump VM size: edit `fly.toml` `[[vm]] size = "performance-4x"` then `fly deploy`. |
| Want to wipe and regenerate world | `fly ssh console -C "rm /data/worlds/*.wld /data/worlds/*.twld"` then `fly machines restart`. |
| Stuck "generating world" past 10 min | Check logs — Large × Master with FTW seed is heavy. If genuinely stuck, restart with `fly machines restart`. |

## License

MIT — TShock is licensed separately, see [Pryaxis/TShock COPYING](https://github.com/Pryaxis/TShock/blob/master/COPYING).
