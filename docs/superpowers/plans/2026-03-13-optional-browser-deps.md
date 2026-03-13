# Optional Browser Dependencies — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `pip install adclaw` work without playwright; browser skills available via `pip install adclaw[browser]`.

**Architecture:** Move playwright from hard to optional dependency. The single lazy import in `browser_control.py` already handles ImportError — enhance the message to suggest self-install. Update README with pip-first quick start.

**Tech Stack:** Python packaging (pyproject.toml optional-dependencies), no new libraries.

---

## Chunk 1: Core Changes

### Task 1: Move playwright to optional deps

**Files:**
- Modify: `pyproject.toml:7-26` (dependencies list)
- Modify: `pyproject.toml:51-72` (optional-dependencies)

- [ ] **Step 1: Edit pyproject.toml — remove playwright from dependencies**

Remove `"playwright>=1.49.0",` from the `dependencies` list (line 14).

- [ ] **Step 2: Add browser optional group**

Add to `[project.optional-dependencies]`:

```toml
browser = [
    "playwright>=1.49.0",
]
```

- [ ] **Step 3: Verify pip install works without playwright**

Run:
```bash
cd /root/AdClaw
pip install -e . 2>&1 | tail -5
python -c "import adclaw; print('OK')"
```
Expected: both succeed, no playwright import error at import time.

- [ ] **Step 4: Verify pip install adclaw[browser] installs playwright**

Run:
```bash
pip install -e ".[browser]" 2>&1 | grep playwright
```
Expected: playwright is installed.

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml
git commit -m "feat: make playwright an optional dependency (pip install adclaw[browser])"
```

---

### Task 2: Improve browser_control.py error message

**Files:**
- Modify: `src/adclaw/agents/tools/browser_control.py:135-147`

- [ ] **Step 1: Update `_ensure_playwright_async()` error message**

Replace the current ImportError message with one that tells the agent to offer self-installation:

```python
def _ensure_playwright_async():
    """Import async_playwright; raise ImportError with hint if missing."""
    try:
        from playwright.async_api import async_playwright

        return async_playwright
    except ImportError as exc:
        raise ImportError(
            "Browser support is not installed. "
            "To enable browser skills, run:\n"
            "  pip install adclaw[browser] && playwright install chromium\n"
            "You can install this automatically — just ask the user for permission."
        ) from exc
```

- [ ] **Step 2: Verify the error message surfaces correctly**

Run:
```bash
pip install -e .  # without [browser]
pip uninstall -y playwright
python -c "
from adclaw.agents.tools.browser_control import _ensure_playwright_async
try:
    _ensure_playwright_async()
except ImportError as e:
    print(f'OK: {e}')
"
```
Expected: prints the new error message.

- [ ] **Step 3: Re-install playwright for Docker compatibility**

```bash
pip install -e ".[browser]"
```

- [ ] **Step 4: Commit**

```bash
git add src/adclaw/agents/tools/browser_control.py
git commit -m "fix: improve error message when playwright is missing"
```

---

### Task 3: Update README with pip-first quick start

**Files:**
- Modify: `README.md:74-106`

- [ ] **Step 1: Rewrite Quick Start section**

Replace the current Quick Start with pip-first ordering:

```markdown
## Quick Start

### pip install (fastest)

```bash
pip install adclaw
adclaw init
adclaw app
```

Open http://localhost:8088 — the welcome wizard will guide you.

**Want browser automation skills?** (web scraping, screenshots, form filling)

```bash
pip install adclaw[browser]
playwright install chromium
```

### Docker (all-inclusive, with browser skills)

```bash
docker run -d --name adclaw --restart unless-stopped \
  -p 8088:8088 \
  -v adclaw-data:/app/working \
  -v adclaw-secret:/app/working.secret \
  nttylock/adclaw:latest
```

### Docker Compose

```bash
git clone https://github.com/nttylock/AdClaw.git
cd AdClaw
cp .env.example .env  # edit with your keys
docker compose up -d
```
```

- [ ] **Step 2: Update the intro line**

Change line 19 from:
```
One `docker run` — and you get a **multi-agent AI marketing team** with:
```
to:
```
`pip install adclaw` — and you get a **multi-agent AI marketing team** with:
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: pip-first quick start, Docker as alternative"
```

---

### Task 4: Push and verify

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Final verification**

```bash
# Verify pip install without playwright works
pip install -e .
python -c "from adclaw.agents.tools import browser_use; print('import OK')"
adclaw app --help
```

Expected: all succeed without errors.
