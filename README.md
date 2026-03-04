<div align="center">

# AdClaw

**AI Marketing Assistant powered by [Citedy](https://www.citedy.com)**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-black.svg?logo=github)](https://github.com/nttylock/AdClaw)
[![License](https://img.shields.io/badge/license-Apache%202.0-red.svg?logo=apache&label=License)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.10%20~%20%3C3.14-blue.svg?logo=python&label=Python)](https://www.python.org/downloads/)

*Fork of [CoPaw](https://github.com/agentscope-ai/CoPaw) by AgentScope (Apache 2.0)*

</div>

---

## What is AdClaw?

One `docker run` — and you get a fully configured AI marketing assistant with:

- **Telegram bot** working out of the box
- **6 Citedy SEO/marketing skills** pre-installed
- **52 marketing tools** via Citedy MCP server
- **Welcome wizard** — paste your API key and start
- **Multi-channel** — Telegram, Discord, DingTalk, Feishu, QQ, Console

### What can it do?

| Feature | Description |
|---------|-------------|
| SEO Articles | Generate 55-language SEO articles (500–8,000 words) |
| Trend Scouting | Scout X/Twitter and Reddit for trending topics |
| Competitor Analysis | Discover and analyze competitors |
| Lead Magnets | Generate checklists, frameworks, swipe files |
| AI Video Shorts | Create UGC short-form videos with subtitles |
| Content Ingestion | Ingest YouTube, PDFs, web pages, audio |
| Social Publishing | Adapt content for LinkedIn, X, Facebook, Reddit |

---

## Quick Start

### Docker (recommended)

```bash
docker run -d --name adclaw --restart unless-stopped \
  -p 8088:8088 \
  -v adclaw-data:/app/working \
  -e CITEDY_API_KEY=your_key_here \
  citedy/adclaw:latest
```

Open http://localhost:8088 — the welcome wizard will guide you.

### Docker Compose

```bash
git clone https://github.com/nttylock/AdClaw.git
cd AdClaw
cp .env.example .env  # edit with your keys
docker compose up -d
```

### From Source

```bash
git clone https://github.com/nttylock/AdClaw.git
cd AdClaw
pip install .
adclaw init
adclaw app
```

---

## Configuration

### Get a Citedy API Key

1. Go to [citedy.com/developer](https://www.citedy.com/developer)
2. Register (free, includes 100 bonus credits)
3. Create an agent and copy the API key (`citedy_agent_...`)
4. Paste in the AdClaw welcome wizard or set `CITEDY_API_KEY` env var

### Connect Telegram

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Copy the bot token
3. Go to AdClaw → Channels → Telegram → paste token → enable

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CITEDY_API_KEY` | Citedy API key for MCP tools and skills | — |
| `ADCLAW_ENABLED_CHANNELS` | Enabled messaging channels | `discord,dingtalk,feishu,qq,console,telegram` |
| `ADCLAW_PORT` | Web UI port | `8088` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | — |
| `TAVILY_API_KEY` | Tavily search API key | — |
| `GITHUB_TOKEN` | GitHub token for skill hub | — |
| `LOG_LEVEL` | Logging level | `INFO` |

---

## Pre-installed Skills

| Skill | Description |
|-------|-------------|
| citedy-seo-agent | Full-stack SEO agent with 52 tools |
| citedy-content-writer | Blog autopilot — articles, illustrations, voice-over |
| citedy-content-ingestion | Ingest YouTube, PDFs, web pages, audio |
| citedy-trend-scout | Scout X/Twitter and Reddit for trends |
| citedy-lead-magnets | Generate checklists, frameworks, swipe files |
| citedy-video-shorts | Create AI UGC short-form videos |
| skill-creator | Create your own custom skills |

Skills auto-update from [Citedy/citedy-seo-agent](https://github.com/Citedy/citedy-seo-agent) via the Skills Hub.

---

## Architecture

```
User → [Telegram/Discord/Console] → AdClaw Agent → [LLM Provider]
                                          ↓
                                    [Citedy MCP Server (52 tools)]
                                    [Built-in Skills (7 packs)]
```

AdClaw is built on [AgentScope](https://github.com/agentscope-ai/AgentScope) and uses:
- **FastAPI** backend (Python)
- **React + Ant Design** web console
- **MCP** (Model Context Protocol) for tool integration
- **Multi-channel** messaging (Telegram, Discord, DingTalk, etc.)

---

## Credits & Pricing

Citedy uses a credit-based system (1 credit = $0.01 USD):

| Operation | Credits |
|-----------|---------|
| Turbo article (500 words) | 2 |
| Standard article (2,500 words) | 20 |
| Pillar article (8,000 words) | 48 |
| X/Twitter scout | 35–70 |
| Reddit scout | 30 |
| Lead magnet | 30–100 |
| AI video short | 60–185 |

Free registration includes 100 credits. [Top up here](https://www.citedy.com/dashboard/billing).

---

## License

Apache 2.0 — see [LICENSE](LICENSE).

Original project: [CoPaw](https://github.com/agentscope-ai/CoPaw) by AgentScope.
