#!/bin/bash
# backup.sh — backup Terraria /data from Fly.io to local machine
# Runs as an infinite loop, backs up every 24 hours, keeps 2 copies

APP="terraria-flyio"
BACKUP_DIR=~/backups/terraria

mkdir -p "$BACKUP_DIR"

while true; do
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  DEST="$BACKUP_DIR/$TIMESTAMP"
  mkdir -p "$DEST"

  echo "[backup] Starting backup → $DEST"

  fly ssh console --app "$APP" -C \
    "tar czf - --exclude='data/tshock/logs' --exclude='data/tshock/crashes' -C / data" \
    > "$DEST/data.tar.gz"

  if [ $? -eq 0 ]; then
    echo "[backup] Done — $(du -sh "$DEST/data.tar.gz" | cut -f1)"
  else
    echo "[backup] Failed — removing incomplete backup"
    rm -rf "$DEST"
  fi

  # เก็บแค่ 2 copies ล่าสุด
  ls -dt "$BACKUP_DIR"/[0-9]*/ 2>/dev/null | tail -n +3 | xargs rm -rf

  echo "[backup] Sleeping 24h..."
  sleep 86400
done
