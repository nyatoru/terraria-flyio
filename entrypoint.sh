#!/bin/sh
# entrypoint.sh — wire Fly's single /data volume into TShock's three expected dirs
set -e

DATA_ROOT="${DATA_ROOT:-/data}"

echo "[entrypoint] Setting up persistent layout under $DATA_ROOT"

mkdir -p "$DATA_ROOT/tshock" \
         "$DATA_ROOT/tshock/logs" \
         "$DATA_ROOT/tshock/crashes" \
         "$DATA_ROOT/worlds" \
         "$DATA_ROOT/plugins"

# Remove any pre-existing empty mount points from the base image and
# symlink them to our /data subdirs so TShock writes through to the volume.
for d in tshock worlds plugins; do
  if [ -e "/$d" ] && [ ! -L "/$d" ]; then
    rm -rf "/$d"
  fi
  ln -sfn "$DATA_ROOT/$d" "/$d"
done

# Fix ownership so the non-root APP_UID (1654) can write
chown -R 1654:1654 "$DATA_ROOT" 2>/dev/null || true

# Detect first run — auto-create a world if none exist
WORLD_ARGS=""
if ! ls "$DATA_ROOT/worlds"/*.wld >/dev/null 2>&1; then
  echo "[entrypoint] No world found — auto-creating '${WORLD_NAME}' (size=${WORLD_SIZE}, diff=${DIFFICULTY})"
  WORLD_ARGS="-autocreate ${WORLD_SIZE} -worldname ${WORLD_NAME} -world /worlds/${WORLD_NAME}.wld"
  [ -n "$SEED" ] && WORLD_ARGS="$WORLD_ARGS -seed ${SEED}"
else
  FIRST_WLD=$(ls "$DATA_ROOT/worlds"/*.wld | head -1)
  echo "[entrypoint] Existing world found: $FIRST_WLD"
  WORLD_ARGS="-world $FIRST_WLD"
fi

# Optional flags
PASS_ARG=""
[ -n "$SERVER_PASS" ] && PASS_ARG="-pass $SERVER_PASS"

echo "[entrypoint] Launching TShock..."
exec ./TShock.Server \
  -configpath /tshock \
  -logpath /tshock/logs \
  -crashdir /tshock/crashes \
  -worldselectpath /worlds \
  -additionalplugins /plugins \
  -maxplayers "${MAX_PLAYERS}" \
  -secure "${SECURE}" \
  -noupnp \
  $PASS_ARG \
  $WORLD_ARGS \
  "$@"
