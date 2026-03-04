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

## Phase 1: Core Branding & Defaults
> **Goal:** Replace CoPaw identity with AdClaw, set sane defaults

- [ ] **1.1** Rename project: CoPaw → AdClaw everywhere (package name, titles, UI text, Docker image name)
- [ ] **1.2** Replace logo and favicon with AdClaw/Citedy branding
- [ ] **1.3** Update `README.md` — new description, install instructions, screenshots
- [ ] **1.4** Set default language to English (config.json `agents.language: "en"`)
- [ ] **1.5** Translate all workspace `.md` files (AGENTS, SOUL, PROFILE, etc.) to English (already done, commit to repo)
- [ ] **1.6** Set `COPAW_ENABLED_CHANNELS` default to include `telegram` in Dockerfile/docker-compose

---

## Phase 2: Pre-installed Citedy Skills
> **Goal:** All 6 Citedy skill packs available in `active_skills/` out of the box

- [ ] **2.1** Add Citedy skills as git submodule or copy into `src/active_skills/`:
  - `citedy-seo-agent` — full-stack SEO agent (trend scout, competitor analysis, 55-language articles, social distribution, AI videos, lead magnets)
  - `citedy-content-writer` — blog autopilot (SEO articles, AI illustrations, voice-over, social adaptation)
  - `citedy-content-ingestion` — ingest URLs (YouTube, PDFs, web pages, audio) into structured content
  - `citedy-trend-scout` — scout X/Twitter and Reddit for trending topics
  - `citedy-lead-magnets` — generate lead magnets (checklists, frameworks, swipe files)
  - `citedy-video-shorts` — create AI UGC short-form videos with subtitles
- [ ] **2.2** Add `skill-creator` skill for users to create their own skills
- [ ] **2.3** Verify all skills load correctly on fresh `docker run`
- [ ] **2.4** Write brief descriptions for each skill visible in the web UI

---

## Phase 3: Citedy MCP Server Integration
> **Goal:** Citedy MCP server (`https://mcp.citedy.com/mcp`) pre-configured and ready to use

- [ ] **3.1** Add Citedy MCP server to default `config.json` → `mcp.clients`:
  ```json
  {
    "citedy": {
      "name": "citedy_mcp",
      "description": "Citedy SEO & Marketing Tools (52 tools)",
      "enabled": true,
      "transport": "sse",
      "url": "https://mcp.citedy.com/mcp",
      "headers": {},
      "env": {
        "CITEDY_API_KEY": ""
      }
    }
  }
  ```
- [ ] **3.2** Ensure MCP tools are available to the agent once API key is set
- [ ] **3.3** Test all 52 MCP tools work through AdClaw
- [ ] **3.4** Reference: [MCP tools spec](https://www.citedy.com/mcp-tools.md), [saas-blog repo](https://github.com/nttylock/saas-blog)

---

## Phase 4: Onboarding UX — API Key & Balance
> **Goal:** Frictionless first-run experience

- [ ] **4.1** Add "Citedy" as a built-in provider in the Models/Providers UI with:
  - Pre-filled base URL
  - **"Get API Key"** button → links to `https://www.citedy.com/developer` or registration endpoint
  - **"Top Up Balance"** button → links to `https://www.citedy.com/billing` (or equivalent)
- [ ] **4.2** Add a first-run wizard / welcome screen:
  1. "Welcome to AdClaw" with logo
  2. "Step 1: Get your Citedy API key" → button opens registration
  3. "Step 2: Paste your API key here" → input field + save
  4. "Step 3: Connect Telegram" → input bot token + save
  5. "You're all set!" → redirect to main chat
- [ ] **4.3** Show credit balance in the UI header/sidebar (via `/api/agent/me` endpoint)
- [ ] **4.4** Add "Top Up" button visible when balance is low

---

## Phase 5: Telegram Channel Improvements
> **Goal:** Telegram works perfectly out of the box

- [ ] **5.1** Telegram enabled by default in Docker image (already solved via env var)
- [ ] **5.2** Add Telegram setup instructions in the welcome wizard
- [ ] **5.3** Add inline keyboard buttons in Telegram for common actions (check balance, list skills, etc.)
- [ ] **5.4** Support Telegram media (images, documents, voice) for content ingestion

---

## Phase 6: Docker & Distribution
> **Goal:** One command to deploy

- [ ] **6.1** Build custom Docker image: `citedy/adclaw:latest` (or `nttylock/adclaw:latest`)
- [ ] **6.2** Create `docker-compose.yml` with all env vars pre-set
- [ ] **6.3** Publish to Docker Hub
- [ ] **6.4** Add deployment templates:
  - DigitalOcean 1-Click
  - Railway / Zeabur template
  - Render blueprint
- [ ] **6.5** Create install script: `curl -sSL https://get.adclaw.dev | bash`

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

## Key Findings from CoPaw Investigation

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Telegram not in UI | `COPAW_ENABLED_CHANNELS` env var missing "telegram" | Add to Dockerfile |
| Aliyun API key "invalid" | Built-in provider uses `coding.dashscope.aliyuncs.com`, key is for `coding-intl` | Create custom provider or fix default URL |
| Skills not visible to bot | Skills placed in `customized_skills/` but bot reads `active_skills/` | Copy to `active_skills/` |
| Workspace files in Chinese | Default templates shipped in Chinese | Translated to English |
| Built-in provider base_url immutable | `allow_base_url=False` for non-custom providers | Must create custom provider via API |

---

*Last updated: 2026-03-04*
*Maintained by: @nttylock*
