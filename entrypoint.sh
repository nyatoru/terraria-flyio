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

# ─── Generate serverconfig.txt ──────────────────────────────────────────
# Write world settings via config file instead of CLI flags.
# TShock reads serverconfig.txt for seed/difficulty — CLI -seed flag
# does NOT support special text seeds like "for the worthy" (TShock bug #2328).
SERVERCONFIG="$DATA_ROOT/tshock/serverconfig.txt"
{
  echo "maxplayers=${MAX_PLAYERS:-8}"
  echo "secure=${SECURE:-1}"
  [ -n "$SERVER_PASS" ] && echo "password=${SERVER_PASS}"
  [ -n "$SEED" ]        && echo "seed=${SEED}"
  [ -n "$DIFFICULTY" ]  && echo "difficulty=${DIFFICULTY}"
  [ -n "$WORLD_EVIL" ]  && echo "worldevil=${WORLD_EVIL}"
  [ -n "$WORLD_NAME" ]  && echo "worldname=${WORLD_NAME}"
  [ -n "$WORLD_SIZE" ]  && echo "autocreate=${WORLD_SIZE}"
} > "$SERVERCONFIG"
echo "[entrypoint] Wrote serverconfig.txt:"
cat "$SERVERCONFIG"

# ─── Deploy config.json (always overwrite) ────────────────────────────
cp /server/config.json "$DATA_ROOT/tshock/config.json"
echo "[entrypoint] Deployed config.json"
# ─── First-run detection ────────────────────────────────────────────────
WORLD_ARGS=""
NAMED_WLD="$DATA_ROOT/worlds/${WORLD_NAME}.wld"
if [ -f "$NAMED_WLD" ]; then
  echo "[entrypoint] Loading existing world: $NAMED_WLD"
  WORLD_ARGS="-world $NAMED_WLD"
else
  echo "[entrypoint] No world named '${WORLD_NAME}' found — auto-creating (size=${WORLD_SIZE}, diff=${DIFFICULTY})"
  WORLD_ARGS="-autocreate ${WORLD_SIZE} -worldname ${WORLD_NAME} -world /worlds/${WORLD_NAME}.wld"
fi

echo "[entrypoint] HOME=$HOME — launching TShock..."
exec ./TShock.Server \
  -configpath /tshock \
  -logpath /tshock/logs \
  -crashdir /tshock/crashes \
  -worldselectpath /worlds \
  -additionalplugins /plugins \
  -savedirectory /worlds \
  -config "$SERVERCONFIG" \
  -noupnp \
  $WORLD_ARGS \
  "$@"
