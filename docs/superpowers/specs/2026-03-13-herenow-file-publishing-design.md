# here.now File Publishing

**Date:** 2026-03-13
**Status:** Approved

## Problem

Agents create files (reports, PDFs, HTML, images) but Telegram and other channels often can't send them as attachments. Users resort to third-party file hosting services manually, which is inconvenient.

## Solution

Integrate here.now — free instant file hosting for agents. Auto-publish files when sending to users, providing both an attachment (if channel supports) and a public link.

## Components

### 1. Tool: `publish_to_herenow`

New tool in `src/adclaw/agents/tools/herenow_publish.py`.

**Input:** file path (local)
**Output:** public URL (`https://slug.here.now/filename`)

**Flow:**
1. Compute SHA-256 hash and file size
2. `POST /api/v1/publish` — create site, get presigned upload URL
3. `PUT presigned-url` — upload file binary
4. `POST /finalize` — publish

**Auth:**
- If `HERENOW_API_KEY` env var is set → `Authorization: Bearer <key>` (permanent links)
- If not set → anonymous mode (24h expiry)
- Header `X-HereNow-Client: adclaw` for debugging

**Error handling:** Return error message on failure, don't block file sending.

### 2. Auto-publish hook

In the file-sending path (where agent sends file to user via channel), before sending:
1. Check `config.json` → `herenow.auto_publish` (default: `true`)
2. If enabled, call `publish_to_herenow`
3. Append link to message: "Download: https://slug.here.now/filename"
4. Send both attachment (if channel supports) and link

If auto-publish is disabled, only send attachment as before.

### 3. Config

In `config.json`:
```json
{
  "herenow": {
    "auto_publish": true
  }
}
```

API key via env var `HERENOW_API_KEY` (standard AdClaw env mechanism).

### 4. Skill: `here-now`

Skill directory `src/adclaw/agents/skills/here-now/` with:
- `SKILL.md` — instructions for explicit use ("upload this file and give me the link")
- `_meta.json` — metadata with `requires.env: ["HERENOW_API_KEY"]`, `primaryEnv: "HERENOW_API_KEY"`

This lets agents call publish explicitly even when auto-publish is off, and provides the standard UI card for API key configuration.

### 5. Tool registration

Add `publish_to_herenow` to `src/adclaw/agents/tools/__init__.py` so it's available as a tool for all agents.

## API Details

**Create:**
```
POST https://here.now/api/v1/publish
Content-Type: application/json
Authorization: Bearer <key>  (optional)

{
  "files": [{
    "path": "report.pdf",
    "size": 12345,
    "contentType": "application/pdf",
    "hash": "<sha256>"
  }]
}
```

**Upload:** `PUT <presigned-url>` with binary file data

**Finalize:** `POST /api/v1/publish/<slug>/finalize` with `{"versionId": "..."}`

**Limits:**
- Anonymous: 250MB/file, 5 uploads/hour, 24h expiry
- Authenticated: 5GB/file, 60 uploads/hour, permanent

## What does NOT change

- Existing file sending logic (attachments still work)
- Other tools/skills
- Channel implementations (hook is in the shared sending path)

## Success criteria

- Agent creates file → user gets link + attachment in Telegram
- Works without API key (anonymous, 24h)
- Works with API key (permanent links)
- Auto-publish toggleable via config
- Agent can call tool explicitly via skill
