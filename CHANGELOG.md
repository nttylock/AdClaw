# Changelog

All notable changes to AdClaw are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] - 2026-03-13

First public release. Fork of [CoPaw](https://github.com/agentscope-ai/CoPaw) with significant additions for AI marketing teams.

### Added

- **Multi-agent personas** — create specialized agents (researcher, writer, SEO, ads) with SOUL.md identity, own LLM, skills, and cron schedule
- **@tag routing** in Telegram — `@researcher find AI trends` sends to the right agent
- **Coordinator delegation** — one agent orchestrates the rest automatically
- **Shared memory** across personas (file-based + vector store)
- **96 built-in skills** — SEO, ads, content, social media, analytics, growth hacking
- **10 agency-agent skills** — growth-hacker, social-media-strategist, tiktok-strategist, instagram-curator, analytics-reporter, app-store-optimizer, reddit-community-builder, trend-researcher, feedback-synthesizer, twitter-engager
- **52 Citedy MCP tools** for SEO and marketing automation
- **4 MCP servers** — citedy, agent_browser, xai_search, exa
- **Always-On Memory (AOM)** — SQLite + sqlite-vec + FTS5, semantic search, auto-consolidation
- **Memory optimization (R1-R4)** — zero-LLM-cost deterministic layers:
  - R1: Pre-compression (rule cleanup + N-gram codebook, 8-15% token savings)
  - R2: Tiered context loading (L0/L1/L2 progressive summaries)
  - R3: Near-duplicate detection (hybrid shingle-hash + word-overlap, 90% rate)
  - R4: Temporal pruning (green >7d delete, yellow >30d condense, red keep)
- **Security scanner** — 208 patterns, 15 categories for skill code analysis
- **Memory sanitizer** — 33 threat patterns, 7 categories for prompt injection defense
- **LLM audit** for skills — async security review via `POST /api/skills/{name}/llm-audit`
- **Self-healing skills** — broken YAML auto-fixed by LLM (3 attempts/session max)
- **Security badges** in UI — visual pattern scan + LLM audit status per skill
- **Skill quality evaluation** — `GET /api/skills/{name}/quality`
- **Frozen memory snapshots** — hash-based prompt caching
- **Browser automation** — Playwright + Chromium + Xvfb in Docker, PinchTab for token-efficient control
- **Telegram bot** — interactive menu, paginated /skills, continuous typing indicator, persistent keyboard
- **Web console** — glassmorphism design, dark pill sidebar, manage personas/skills/models/channels
- **Agent watchdog** — auto-restart on crash
- **Diagnostics page** — health status, error log, restart button
- **Docker image** with multi-stage build, entrypoint auto-configuration

### Security

- Removed hardcoded API keys and internal IPs from test files
- All secrets loaded from environment variables or mounted volumes
- `.gitignore` covers config.json, providers.json, envs.json, .env files

---

## [Unreleased]

### Planned

- Landing page (clawsy.app or GitHub Pages)
- WhatsApp channel support
- WASM sandbox for skill execution isolation
- Docker image size optimization (multi-stage improvements)
