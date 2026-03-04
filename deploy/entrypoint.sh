#!/bin/sh
# Substitute ADCLAW_PORT in supervisord template and start supervisord.
# Default port 8088; override at runtime with -e ADCLAW_PORT=3000.
set -e
export ADCLAW_PORT="${ADCLAW_PORT:-8088}"

# Enable Citedy MCP client if API key is provided at runtime
if [ -n "$CITEDY_API_KEY" ]; then
  CONFIG="${ADCLAW_WORKING_DIR:-/app/working}/config.json"
  if [ -f "$CONFIG" ]; then
    python3 -c "
import json, os
cfg_path = os.environ.get('ADCLAW_WORKING_DIR', '/app/working') + '/config.json'
with open(cfg_path) as f:
    cfg = json.load(f)
mcp = cfg.setdefault('mcp', {}).setdefault('clients', {})
key = os.environ['CITEDY_API_KEY']
mcp['citedy'] = {
    'name': 'citedy_mcp',
    'description': 'Citedy SEO & Marketing Tools (52 tools)',
    'enabled': True,
    'transport': 'streamable_http',
    'url': 'https://mcp.citedy.com/mcp',
    'headers': {'Authorization': f'Bearer {key}', 'Accept': 'application/json, text/event-stream'},
    'env': {'CITEDY_API_KEY': key},
}
with open(cfg_path, 'w') as f:
    json.dump(cfg, f, indent=2)
print('entrypoint: Citedy MCP client enabled')
" 2>/dev/null || true
  fi
fi

envsubst '${ADCLAW_PORT}' \
  < /etc/supervisor/conf.d/supervisord.conf.template \
  > /etc/supervisor/conf.d/supervisord.conf
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
