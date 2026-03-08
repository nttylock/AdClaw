#!/bin/sh
# Substitute ADCLAW_PORT in supervisord template and start supervisord.
# Default port 8088; override at runtime with -e ADCLAW_PORT=3000.
set -e
export ADCLAW_PORT="${ADCLAW_PORT:-8088}"

# Ensure config.json exists (first run only — don't overwrite user config)
CONFIG="${ADCLAW_WORKING_DIR:-/app/working}/config.json"
if [ ! -f "$CONFIG" ] || [ ! -s "$CONFIG" ]; then
  echo "entrypoint: No config.json found, generating default..."
  adclaw init --defaults --accept-security 2>/dev/null || true
fi

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

# Enable Exa search MCP if API key is provided at runtime
if [ -n "$EXA_API_KEY" ]; then
  CONFIG="${ADCLAW_WORKING_DIR:-/app/working}/config.json"
  if [ -f "$CONFIG" ]; then
    python3 -c "
import json, os
cfg_path = os.environ.get('ADCLAW_WORKING_DIR', '/app/working') + '/config.json'
with open(cfg_path) as f:
    cfg = json.load(f)
mcp = cfg.setdefault('mcp', {}).setdefault('clients', {})
key = os.environ['EXA_API_KEY']
mcp['exa'] = {
    'name': 'exa_mcp',
    'description': 'Exa AI search: web, code, people, companies',
    'enabled': True,
    'command': 'npx',
    'args': ['-y', 'exa-mcp-server'],
    'env': {'EXA_API_KEY': key},
}
with open(cfg_path, 'w') as f:
    json.dump(cfg, f, indent=2)
print('entrypoint: Exa MCP client enabled')
" 2>/dev/null || true
  fi
fi

# Enable Telegram channel if bot token is provided at runtime
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  CONFIG="${ADCLAW_WORKING_DIR:-/app/working}/config.json"
  if [ -f "$CONFIG" ]; then
    python3 -c "
import json, os
cfg_path = os.environ.get('ADCLAW_WORKING_DIR', '/app/working') + '/config.json'
with open(cfg_path) as f:
    cfg = json.load(f)
tg = cfg.setdefault('channels', {}).setdefault('telegram', {})
tg['enabled'] = True
tg['bot_token'] = os.environ['TELEGRAM_BOT_TOKEN']
with open(cfg_path, 'w') as f:
    json.dump(cfg, f, indent=2)
print('entrypoint: Telegram channel enabled')
" 2>/dev/null || true
  fi
fi

envsubst '${ADCLAW_PORT}' \
  < /etc/supervisor/conf.d/supervisord.conf.template \
  > /etc/supervisor/conf.d/supervisord.conf
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
