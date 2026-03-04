#!/bin/sh
# Substitute ADCLAW_PORT in supervisord template and start supervisord.
# Default port 8088; override at runtime with -e ADCLAW_PORT=3000.
set -e
export ADCLAW_PORT="${ADCLAW_PORT:-8088}"
envsubst '${ADCLAW_PORT}' \
  < /etc/supervisor/conf.d/supervisord.conf.template \
  > /etc/supervisor/conf.d/supervisord.conf
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
