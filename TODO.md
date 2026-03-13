# AdClaw — Global Task Checklist

> **Last updated**: 2026-03-13 (post-audit)
> **Maintained by**: @nttylock + Claude

---

## Done (recent)

### Telegram Bot
- [x] Interactive menu: /personas, /model, /skills, /status, /new
- [x] Persistent reply keyboard (5 buttons)
- [x] Paginated /skills (10 per page, inline nav buttons)
- [x] Continuous typing indicator (4s loop)
- [x] /start welcome message + keyboard
- [x] /compact, /clear, /history as direct commands
- [x] @botname stripping from commands
- [x] Model menu sends API id (not display name)

### Console UI Redesign
- [x] Phase 1: Gradient backgrounds, glassmorphism header, pill buttons, Slate colors
- [x] Phase 2: Glassmorphism cards (Skills, MCP, Personas, Models, Channels)
- [x] Phase 3: Dark pill sidebar navigation
- [x] Phase 4: Glassmorphism modals, badges, hover animations, gradient text
- [x] `citedy-overrides.less` — global Ant Design overrides
- [x] Full audit documented in `docs/design/ADMIN_UI_AUDIT.md`

### Skills & Security
- [x] Self-healing skills (async, streaming-aware LLM caller)
- [x] Security scanner: 208 patterns, 15 categories
- [x] Memory sanitizer: 33 threat patterns, 7 categories
- [x] LLM audit for skills (`POST /api/skills/{name}/llm-audit`)
- [x] Security badges in UI (pattern scan + score)
- [x] Skill quality eval module (`GET /api/skills/{name}/quality`)
- [x] Frozen memory snapshots (hash-based prompt caching)

### Citedy Skills (6 installed)
- [x] anycrawl-instagram-scraper
- [x] anycrawl-tiktok-scraper
- [x] anycrawl-youtube-video-extractor
- [x] anycrawl-social-extractor (router)
- [x] domain-hunter
- [x] skill-quality-eval

### Multi-Agent Personas
- [x] SOUL.md per agent, @tag routing
- [x] Shared memory across personas
- [x] Coordinator + specialist architecture
- [x] UI: CRUD, templates, cron config

### Memory Optimization (claw-compactor R1-R4)
- [x] R1: Deterministic pre-compression (`compressor.py`) — rule-based cleanup + N-gram codebook, 8-15% savings
- [x] R2: Tiered context loading (`tiers.py`) — L0/L1/L2 progressive summaries by priority scoring
- [x] R3: Near-duplicate detection (`dedup.py`) — hybrid shingle-hash + word-overlap, 90% live detection rate
- [x] R4: Temporal pruning in consolidation — green >7d delete, yellow >30d condense, red never
- [x] AOM REST API: `skip_llm` parameter for bulk ingestion
- [x] Live stress-test script (`scripts/test_memory_live.py`) — 120 memories, dedup verification

### Infrastructure
- [x] Agent watchdog (auto-restart on crash)
- [x] Diagnostics page + API (health, errors, restart)
- [x] AOM (Always-On Memory) agent
- [x] 96+ built-in skills, 10 agency-agent skills
- [x] 4 MCP servers (citedy, agent_browser, xai_search, exa)
- [x] Browser automation (Playwright + Xvfb in Docker)

### v0.1.0 Release Prep
- [x] Security audit: removed hardcoded API keys and internal IPs from repo
- [x] CHANGELOG.md created (v0.1.0)
- [x] Non-root user in Docker (app runs as `adclaw`, system services as root)
- [x] docker-compose.yml: added secret volume (`adclaw-secret:/app/working.secret`)
- [x] `.env.example` updated: EXA_API_KEY, XAI_API_KEY, QWEN_* test vars
- [x] Docker image rebuilt and verified (116 skills, web UI, API working)

---

## In Progress

### Clawsy / AgentHub
- [x] Task Registry MVP (3 tables, 8 endpoints, 2 dashboard pages)
- [x] E2E tested (31 patches, 3 agents, scoring loop)
- [ ] Invite links (share tasks without auth)
- [ ] Blackbox mode (agents can't see each other's patches)
- [ ] Karma spending system
- [ ] Agent leaderboard

---

## TODO (prioritized)

### High Priority — v0.1.0 Release Blockers
- [ ] **Deploy fresh Docker image** to production (`docker push` + redeploy on claude-worker)
- [ ] **Smoke test** on production: Telegram bot, web UI, memory API, skills
- [ ] **GitHub Release** — tag `v0.1.0`, attach release notes from CHANGELOG.md
- [ ] **Docker Hub push** — `nttylock/adclaw:0.1.0` + `latest`

### High Priority — Post-Release
- [ ] **Landing page** — GitHub Pages or clawsy.app (Phase 7.2 from ROADMAP)
- [ ] **Demo video** — Telegram bot in action (Phase 7.3)
- [ ] **Product Hunt / Reddit launch** (Phase 7.4)
- [ ] **WhatsApp channel** — mass market messenger support

### Medium Priority
- [ ] Docstrings: office validators (39 missing), browser/proxy (23), aggregation (27)
- [ ] Test fixtures: replace `/tmp/test` with `tmp_path` in `test_delegation.py` (8 locations)
- [ ] Skill quality eval auto-run on skill creation (integrate into `create_skill()` pipeline)
- [ ] Citedy LAYER 5 UX: filters by threat/platform/date, bulk actions, virtual scroll
- [ ] Content Gaps refactoring: SSE progress, cost estimation, history
- [ ] WASM sandbox for skill execution isolation
- [ ] Disk cleanup automation (Docker prune on build, log rotation)

### Low Priority
- [ ] Optimize Docker image size (currently ~3.3 GB — consider slimmer base image)
- [ ] Two-tone gradient headings in console (decorative)
- [ ] Advanced animations (underglow, conic loading, AI glow)
- [ ] Signal / Discord bot improvements

---

## Key URLs

| Resource | URL |
|----------|-----|
| GitHub | https://github.com/nttylock/AdClaw |
| Docker Hub | nttylock/adclaw:latest |

---

*Update this file after completing tasks. Commit with changes.*
