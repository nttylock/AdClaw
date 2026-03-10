# Self-Healing Skills + Security Badges

## Self-Healing Flow

Skill registration fails → read SKILL.md + error → send to user's LLM → write fixed file → retry (max 1). Scope: YAML frontmatter only (missing name/description, unicode escapes, syntax errors). Not scripts, not markdown body.

New module: `src/adclaw/agents/skill_healer.py`, called from `react_agent._register_skills()`.

## Security Scan

Triggered on: skill create/update, after auto-heal. Cached in `{skill_dir}/.scan.json`. Re-scans only when file_hash changes.

Score: base 100, deduct per finding (critical -25, high -15, medium -8, low -3, LLM warning -5). Min 0.

## API

- `GET /api/skills` includes `security` summary per skill
- `GET /api/skills/{name}/security` returns full scan details

## UI Badges

On each skill card: pattern scan badge, LLM audit badge, auto-healed indicator, score/100 with color coding. Click badge for tooltip details.

## Notifications

Auto-heal events shown as toast in web UI + logged.
