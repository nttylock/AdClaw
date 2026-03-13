# Optional Browser Dependencies

**Date:** 2026-03-13
**Status:** Approved

## Problem

AdClaw requires Docker for installation because `playwright>=1.49.0` is a hard dependency. This blocks the simpler `pip install adclaw` path that 90% of users would prefer — only 6 of 116 skills need a browser.

## Solution

Make playwright an optional dependency. `pip install adclaw` works without it. Browser skills remain visible but prompt for installation when invoked.

## Changes

### 1. pyproject.toml

Move `playwright>=1.49.0` from `dependencies` to optional:

```toml
[project.optional-dependencies]
browser = ["playwright>=1.49.0"]
```

### 2. browser_control.py

Already has `ImportError` handling for playwright. Enhance the error path to return a user-friendly message:

- Detect missing playwright at skill invocation time
- Return message: "This skill requires browser support. Install with: `pip install adclaw[browser] && playwright install chromium`"
- Include a flag/signal that the agent can act on to offer self-installation

### 3. Browser skills behavior (6 skills)

When playwright is not installed:
- Skills appear in `/api/skills` list (visible, not hidden)
- On invocation, the skill returns an actionable error message
- The LLM agent can offer to install `adclaw[browser]` and `playwright install chromium` on the user's behalf
- After installation, the skill works immediately (no restart needed, playwright uses lazy imports)

The 6 browser skills: `browser-use`, `agent-browser`, `browser_visible`, `camoufox`, `crawl4ai`, `firecrawl`.

### 4. Docker

No changes. Dockerfile continues to install the full package with browser support pre-configured. Docker = full version always.

### 5. README

Add two installation paths:

```bash
# Quick start (no browser)
pip install adclaw
adclaw app

# With browser skills
pip install adclaw[browser]
playwright install chromium
adclaw app
```

## What does NOT change

- Docker image, Dockerfile, supervisord config
- config.py MCP server definitions (loaded on demand)
- All 110 non-browser skills
- REST API, channels (Telegram, Discord, etc.)
- Security features (memory sanitizer, skill scanner)

## Success criteria

- `pip install adclaw` succeeds without playwright installed
- `adclaw app` starts and serves all non-browser skills
- Browser skill invocation without playwright returns clear install instructions
- Docker image works as before with all 116 skills
