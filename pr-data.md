# AdClaw v0.1.0 — PR / Social Media Texts

## Main Post

**AdClaw v0.1.0 — 4 days of shipping**

Just pushed AdClaw v0.1.0 to GitHub + Docker Hub. Here's what landed:

**Security hardened**
- 208-pattern skill scanner, 33-pattern memory sanitizer
- LLM-powered security audits for every skill
- Self-healing skills — broken YAML auto-fixed by your LLM
- All hardcoded secrets removed from repo before going public

**117 built-in skills**
- SEO, ads, content, social media, analytics, growth hacking
- 6 browser automation skills (Playwright, PinchTab, Camoufox)
- 10 agency-agent personas (growth hacker, TikTok strategist, etc.)

**Instant file publishing via here.now**
- Agent creates a file → auto-uploads to here.now → sends you a shareable link
- Works in Telegram, Discord, any channel. Zero config needed.
- Anonymous (24h) by default, permanent with API key

**pip install adclaw**
- No Docker required anymore. `pip install adclaw && adclaw app` — done.
- Browser skills optional: `pip install adclaw[browser]`
- Docker still available for all-inclusive setup

**Multi-agent personas**
- SOUL.md per agent, @tag routing in Telegram
- Coordinator delegates to specialists automatically
- Shared memory across the team

**Telegram improvements**
- Markdown formatting (bold, italic, code blocks render properly)
- Interactive menus, persistent keyboard, paginated skills

Open source, Apache 2.0 → github.com/nttylock/AdClaw

---

## Docker & Browser Skills

**Docker = full AI workstation in one command**

The Docker image ships with a complete virtual desktop inside: Chromium, Xvfb, Xfce4, PinchTab — your agent gets its own screen, its own browser, its own mouse. It can literally browse the web, fill forms, take screenshots, scrape pages — all headless, all autonomous.

6 browser skills out of the box:
- **browser-use** — Playwright-powered: click, type, scroll, extract data from any page
- **camoufox** — anti-detect Firefox for bot-protected sites (X/Twitter, Naver)
- **crawl4ai** — AI web scraping with JS rendering
- **browser_visible** — headed mode for demos and debugging
- **agent-browser** — MCP-based browser control
- **PinchTab** — token-efficient browser snapshots (Go binary, uses 10x fewer tokens than raw DOM)

All running inside a single container. No GPU, no $200/mo cloud — a $5 VPS handles it.

Don't need browsers? `pip install adclaw` — 110 skills, no Docker, no Chromium, 30-second setup. Need browsers later? `pip install adclaw[browser]` — agent installs Chromium itself.

Two install paths, one codebase. Pick your weight class.

---

## Memory System

**Memory system — your agent actually remembers**

AdClaw ships with AOM (Always-On Memory) — a persistent memory agent that runs alongside your team. Every conversation, every research finding, every decision gets stored, indexed, and recalled when relevant.

But raw memory hoarding kills your token budget. So we built a 4-stage compression pipeline:

- **R1: Deterministic pre-compression** — rule-based cleanup + N-gram codebook strips 8-15% of tokens before anything hits the LLM
- **R2: Tiered context loading** — L0/L1/L2 progressive summaries. Fresh critical context loads first, old low-priority stuff gets condensed or skipped entirely
- **R3: Near-duplicate detection** — hybrid shingle-hash + word-overlap catches 90% of repeated information live, before it wastes context window space
- **R4: Temporal pruning** — memories older than 7 days get auto-deleted if low value, 30+ days get condensed. High-value memories stay forever

The result: agents with long-term memory that doesn't blow up your API bill. Same context quality, fraction of the tokens.

On top of that — **Frozen Memory Snapshots**: hash-based prompt caching so identical context windows get reused instead of recomputed. Cache HIT = zero extra tokens.

72 memories stored, zero wasted. Your agent remembers last week's research when writing today's article — without re-reading everything from scratch.
