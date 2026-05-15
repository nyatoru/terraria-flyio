#!/bin/sh
# entrypoint.sh — wire Fly's single /data volume into TShock's three expected dirs
#
# CRITICAL: Fly machines have ephemeral filesystems — only /data (the mounted
# volume) survives restarts. Everything that must persist MUST live on /data.
#
# TShock writes to multiple paths. We redirect them ALL to /data:
#
#   /tshock           → /data/tshock     config.json, tshock.sqlite (users/groups/
#                                        permissions), logs/, crashes/, .tplr SSC
#                                        server-side character data
#   /worlds           → /data/worlds     .wld, .twld, .bak world files
#   /plugins          → /data/plugins    custom plugin .dll files
#   $HOME/.local/share/Terraria → /data/terraria-home
#                                        Terraria itself sometimes writes here
#                                        (legacy XDG path for player/world data)
#
set -e

DATA_ROOT="${DATA_ROOT:-/data}"

echo "[entrypoint] Wiring persistent layout under $DATA_ROOT"

# Persistent subdirs on the volume
mkdir -p "$DATA_ROOT/tshock" \
         "$DATA_ROOT/tshock/logs" \
         "$DATA_ROOT/tshock/crashes" \
         "$DATA_ROOT/worlds" \
         "$DATA_ROOT/plugins" \
         "$DATA_ROOT/terraria-home/.local/share/Terraria"

# Replace each VOLUME mount point in the base image with a symlink to /data.
# Wipe the original (empty) dir first so the symlink can be created.
for d in tshock worlds plugins; do
  if [ -e "/$d" ] && [ ! -L "/$d" ]; then
    rm -rf "/$d"
  fi
  ln -sfn "$DATA_ROOT/$d" "/$d"
done

# Redirect HOME to the volume so any XDG-style writes
# (~/.local/share/Terraria/{Worlds,Players,...}) land on /data too.
export HOME="$DATA_ROOT/terraria-home"

# Fix ownership so the non-root APP_UID (1654) baked into the image can write
chown -R 1654:1654 "$DATA_ROOT" 2>/dev/null || true

# ─── First-run detection ────────────────────────────────────────────────
WORLD_ARGS=""
if ! ls "$DATA_ROOT/worlds"/*.wld >/dev/null 2>&1; then
  echo "[entrypoint] No world found — auto-creating '${WORLD_NAME}' (size=${WORLD_SIZE}, diff=${DIFFICULTY})"
  WORLD_ARGS="-autocreate ${WORLD_SIZE} -worldname ${WORLD_NAME} -world /worlds/${WORLD_NAME}.wld"
  [ -n "$SEED" ] && WORLD_ARGS="$WORLD_ARGS -seed ${SEED}"
  [ -n "$DIFFICULTY" ] && WORLD_ARGS="$WORLD_ARGS -difficulty ${DIFFICULTY}"
else
  FIRST_WLD=$(ls "$DATA_ROOT/worlds"/*.wld | head -1)
  echo "[entrypoint] Loading existing world: $FIRST_WLD"
  WORLD_ARGS="-world $FIRST_WLD"
fi

PASS_ARG=""
[ -n "$SERVER_PASS" ] && PASS_ARG="-pass $SERVER_PASS"

echo "[entrypoint] HOME=$HOME — launching TShock..."
exec ./TShock.Server \
  -configpath /tshock \
  -logpath /tshock/logs \
  -crashdir /tshock/crashes \
  -worldselectpath /worlds \
  -additionalplugins /plugins \
  -savedirectory /worlds \
  -maxplayers "${MAX_PLAYERS}" \
  -secure "${SECURE}" \
  -noupnp \
  $PASS_ARG \
  $WORLD_ARGS \
  "$@"
