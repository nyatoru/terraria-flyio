# Terraria TShock Server on Fly.io
# Based on official Pryaxis/TShock image
FROM ghcr.io/pryaxis/tshock:stable

# World data persists via Fly.io volume mounted at /world
# Server port: 7777 (TCP)

LABEL org.opencontainers.image.source="https://github.com/nyatoru/terraria-flyio"
LABEL org.opencontainers.image.description="TShock Terraria server for Fly.io"

# Default world config (overridable via env vars)
ENV WORLD_SIZE=2
ENV WORLD_NAME="FlyWorld"
ENV MAX_PLAYERS=8
ENV DIFFICULTY=0
ENV SERVER_PASS=""
ENV SECURE=1

EXPOSE 7777

# Auto-create world on first start if no .wld files exist
# Then run the server
CMD if [ ! -f /world/*.wld ]; then \
      echo "No world found, auto-creating..."; \
      exec dotnet TShock.dll \
        -world /world/${WORLD_NAME}.wld \
        -autocreate ${WORLD_SIZE} \
        -worldname "${WORLD_NAME}" \
        -maxplayers ${MAX_PLAYERS} \
        -difficulty ${DIFFICULTY} \
        ${SERVER_PASS:+-pass ${SERVER_PASS}} \
        -secure ${SECURE} \
        -noupnp; \
    else \
      echo "World found, loading existing world..."; \
      FIRST_WLD=$(ls /world/*.wld | head -1); \
      exec dotnet TShock.dll \
        -world "${FIRST_WLD}" \
        -maxplayers ${MAX_PLAYERS} \
        ${SERVER_PASS:+-pass ${SERVER_PASS}} \
        -secure ${SECURE} \
        -noupnp; \
    fi
