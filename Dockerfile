# Terraria TShock Server on Fly.io
# Single-volume layout: all persistent data lives under /data
#
#   /data/tshock   → config.json, sscconfig.json, logs, crashes,
#                    tshock.sqlite (users/groups/perms), .tplr (SSC player data)
#   /data/worlds   → *.wld, *.twld, *.bak (world files)
#   /data/plugins  → custom *.dll plugins
#
# The upstream image declares /tshock, /worlds, /plugins as VOLUME, but Fly
# only mounts one volume per app. We override the entrypoint and bind each
# expected path to a subdir of /data via symlink at boot.

FROM ghcr.io/pryaxis/tshock:stable

LABEL org.opencontainers.image.source="https://github.com/nyatoru/terraria-flyio"
LABEL org.opencontainers.image.description="TShock Terraria server for Fly.io"

USER root

# Editing tools for live config tweaks via `fly ssh console`
RUN apt-get update \
 && apt-get install -y --no-install-recommends nano vim jq \
 && rm -rf /var/lib/apt/lists/*

# World / server defaults (override with `fly secrets set ...`)
ENV WORLD_SIZE=3 \
    WORLD_NAME=ForTheWorthy \
    MAX_PLAYERS=8 \
    DIFFICULTY=2 \
    SERVER_PASS="" \
    SECURE=1 \
    SEED="for the worthy"

# Install Bun and build web admin panel
RUN curl -fsSL https://bun.sh/install | bash
COPY web/ /web/
RUN /root/.bun/bin/bun install --cwd /web && /root/.bun/bin/bun --cwd /web run build

# Custom entrypoint: wire /data → /tshock /worlds /plugins, then exec server
COPY entrypoint.sh /entrypoint.sh
COPY config.json /server/config.json
RUN chmod +x /entrypoint.sh

EXPOSE 7777 7878 17777

ENTRYPOINT ["/entrypoint.sh"]
