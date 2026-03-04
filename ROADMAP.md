# AdClaw — Roadmap & Implementation Plan

> **Fork of [CoPaw](https://github.com/agentscope-ai/CoPaw) by AgentScope (Apache 2.0)**
> Customized as a ready-to-use AI marketing assistant powered by [Citedy](https://www.citedy.com)

---

## Vision

One `docker run` — and the user gets a fully configured AI marketing assistant with:
- Telegram bot working out of the box
- 6 Citedy SEO/marketing skills pre-installed
- Citedy MCP server connected (52 tools)
- One-click API key registration
- One-click balance top-up
- No configuration needed beyond pasting the API key

---

## Phase 1: Core Branding & Defaults ✅
> **Goal:** Replace CoPaw identity with AdClaw, set sane defaults

- [x] **1.1** Rename project: CoPaw → AdClaw everywhere (package name, titles, UI text, Docker image name)
- [x] **1.2** Replace logo and favicon with AdClaw branding (SVG renamed)
- [x] **1.3** Update `README.md` — rebranded
- [x] **1.4** Set default language to English (config.py `agents.language: "en"`)
- [x] **1.5** Translate all workspace `.md` files (AGENTS, SOUL, PROFILE, etc.) to English
- [x] **1.6** Set `ADCLAW_ENABLED_CHANNELS` default to include `telegram` in Dockerfile

---

## Phase 2: Pre-installed Citedy Skills ✅
> **Goal:** All 6 Citedy skill packs available in `active_skills/` out of the box

- [x] **2.1** Bundle 6 Citedy skills into `src/adclaw/agents/skills/`:
  - `citedy-seo-agent` — full-stack SEO agent
  - `citedy-content-writer` — blog autopilot
  - `citedy-content-ingestion` — ingest URLs into structured content
  - `citedy-trend-scout` — scout X/Twitter and Reddit for trends
  - `citedy-lead-magnets` — generate lead magnets
  - `citedy-video-shorts` — create AI UGC short-form videos
- [x] **2.2** Add `skill-creator` skill for users to create their own skills
- [x] **2.3** Add "Update Citedy Skills" API endpoint (`POST /api/skills/hub/update-citedy`) to pull latest from GitHub
- [ ] **2.4** Verify all skills load correctly on fresh `docker run` (requires runtime test)

---

## Phase 3: Citedy MCP Server Integration ✅
> **Goal:** Citedy MCP server (`https://mcp.citedy.com/mcp`) pre-configured and ready to use

- [x] **3.1** Add Citedy MCP server to default `config.py` → `MCPConfig.clients`:
  ```json
  {
    "citedy": {
      "name": "citedy_mcp",
      "description": "Citedy SEO & Marketing Tools (52 tools)",
      "enabled": true,
      "transport": "streamable_http",
      "url": "https://mcp.citedy.com/mcp",
      "env": {"CITEDY_API_KEY": ""}
    }
  }
  ```
- [ ] **3.2** Ensure MCP tools are available to the agent once API key is set (requires runtime test)
- [ ] **3.3** Test all 52 MCP tools work through AdClaw (requires runtime test)
- [x] **3.4** Reference: [MCP tools spec](https://www.citedy.com/mcp-tools.md), [saas-blog repo](https://github.com/nttylock/saas-blog)

---

## Phase 4: Onboarding UX — API Key & Balance ✅
> **Goal:** Frictionless first-run experience

- [x] **4.1** Add "Citedy" section in MCP/Settings UI with:
  - **"Get API Key"** button → links to `https://www.citedy.com/developer`
  - **"Top Up Balance"** button → links to `https://www.citedy.com/dashboard/billing`
- [x] **4.2** Add a first-run wizard / welcome screen:
  1. "Welcome to AdClaw" with logo
  2. "Step 1: Get your Citedy API key" → button opens registration
  3. "Step 2: Paste your API key here" → input field + save
  4. "Step 3: Connect Telegram" → input bot token + save
  5. "You're all set!" → redirect to main chat
- [x] **4.3** Show credit balance in the UI header/sidebar (via Citedy `/api/agent/me` endpoint)
- [x] **4.4** Add "Top Up" button visible when balance is low

---

## Phase 5: Telegram Channel Improvements ✅
> **Goal:** Telegram works perfectly out of the box

- [x] **5.1** Telegram enabled by default in Docker image (env var set)
- [x] **5.2** Add Telegram setup instructions in the welcome wizard
- [x] **5.3** Add inline keyboard buttons in Telegram for common actions
- [x] **5.4** Support Telegram media (images, documents, voice) for content ingestion (already supported upstream)

---

## Phase 6: Docker & Distribution
> **Goal:** One command to deploy

- [ ] **6.1** Build custom Docker image: `citedy/adclaw:latest`
- [x] **6.2** Create `docker-compose.yml` with all env vars pre-set
- [ ] **6.3** Publish to Docker Hub
- [ ] **6.4** Add deployment templates (DigitalOcean, Railway, Render)
- [ ] **6.5** Create install script: `curl -sSL https://get.adclaw.dev | bash`
- [x] **6.6** Add `.env.example` with all supported variables
- [x] **6.7** Update GitHub Actions workflow for Docker Hub builds (`latest` + version tags)

---

## Phase 7: Documentation & Launch
> **Goal:** Ready for public launch

- [ ] **7.1** Write docs: Getting Started, Configuration, Skills Guide, API Reference
- [ ] **7.2** Create landing page (GitHub Pages or separate)
- [ ] **7.3** Record demo video (Telegram bot in action with Citedy skills)
- [ ] **7.4** Publish announcement (GitHub, Twitter/X, Reddit, Product Hunt)
- [ ] **7.5** Add GitHub Actions CI/CD for automated Docker builds on release

---

## Technical References

| Resource | URL |
|----------|-----|
| CoPaw upstream | https://github.com/agentscope-ai/CoPaw |
| AdClaw fork | https://github.com/nttylock/AdClaw |
| Citedy MCP tools | https://www.citedy.com/mcp-tools.md |
| Citedy skill spec | https://www.citedy.com/skill.md |
| Citedy agents spec | https://www.citedy.com/agents.md |
| Citedy skills repo | https://github.com/Citedy/citedy-seo-agent |
| MCP server endpoint | https://mcp.citedy.com/mcp |
| Citedy developer portal | https://www.citedy.com/developer |

---

*Last updated: 2026-03-04*
*Maintained by: @nttylock*
