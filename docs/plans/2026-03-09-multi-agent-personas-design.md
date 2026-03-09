# Multi-Agent Personas — Design Document

**Date:** 2026-03-09
**Status:** Draft
**Approach:** Variant A — single instance, multiple SOUL.md

## Summary

Add multi-agent support to AdClaw where each agent ("persona") has its own SOUL.md,
LLM config, skills, and MCP clients. Users create as many agents as they need via
Web UI. In Telegram, users @tag the agent name; messages without a tag go to the
coordinator (current default agent).

## Architecture

```
Telegram message
    │
    ├── @researcher найди тренды AI  ──→  Router  ──→  Agent "researcher"
    │                                        │          (SOUL: researcher.md)
    │                                        │          (LLM: grok-3-mini)
    │                                        │          (MCP: brave_search, xai_search)
    │
    ├── @content напиши пост          ──→  Router  ──→  Agent "content"
    │                                        │          (SOUL: content.md)
    │                                        │          (LLM: qwen3.5-plus)
    │                                        │          (MCP: citedy)
    │
    └── сделай отчёт за неделю        ──→  Router  ──→  Coordinator (default agent)
                                                        (SOUL: current SOUL.md)
                                                        (LLM: default model)
                                                        → can delegate to others
```

## Data Model

### Agent Definition (config.json → agents.personas[])

```json
{
  "agents": {
    "personas": [
      {
        "id": "researcher",
        "name": "Researcher",
        "soul_md": "## Role\nYou are a research specialist...",
        "model_provider": "aliyun-intl",
        "model_name": "qwen3.5-plus",
        "skills": ["exa_search", "trend_analysis"],
        "mcp_clients": ["brave_search", "xai_search"],
        "is_coordinator": false,
        "cron": {
          "enabled": true,
          "schedule": "0 8,14,20 * * *",
          "prompt": "Scan X, HN, and Google AI blog for AI trends. Write report to shared memory.",
          "output": "both"
        }
      }
    ],
    "defaults": { ... },
    "running": { ... }
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug, used as @tag in Telegram |
| `name` | string | Display name in UI |
| `soul_md` | string | Full SOUL.md content (markdown textarea in UI) |
| `model_provider` | string | Provider from existing providers list |
| `model_name` | string | Model from that provider |
| `skills` | string[] | Subset of installed skills (empty = all) |
| `mcp_clients` | string[] | Subset of configured MCP clients (empty = all) |
| `is_coordinator` | bool | Only one agent can be coordinator |
| `cron.enabled` | bool | Run on schedule |
| `cron.schedule` | string | Cron expression |
| `cron.prompt` | string | What to execute |
| `cron.output` | "chat" \| "file" \| "both" | Where to send results |

## Routing Logic

### Telegram

1. Parse incoming message for `@agent_id` pattern at the start
2. If found → route to that agent
3. If not found → route to coordinator (the persona with `is_coordinator: true`)
4. If no coordinator set → route to default agent (current behavior, SOUL.md from working dir)

### Web UI Chat

- Dropdown/tab to select agent before sending message
- Each agent has its own chat history (separate session_id prefix: `{agent_id}_{session_id}`)

### Cron

- Each persona with `cron.enabled` gets registered in CronManager
- Job ID: `persona_{agent_id}`
- Output routing based on `cron.output`:
  - `"chat"` → send to Telegram
  - `"file"` → write to `/app/working/shared/{agent_id}/output.md`
  - `"both"` → both

## Delegation (Coordinator → Agent)

When coordinator needs to delegate, it uses a built-in tool:

```python
@tool
def delegate_to_agent(agent_id: str, task: str) -> str:
    """Delegate a task to a specific agent and return their response.

    Args:
        agent_id: The persona ID to delegate to (e.g., "researcher", "content")
        task: The task description / prompt for the agent

    Returns:
        The agent's response text
    """
```

- Coordinator calls `delegate_to_agent("researcher", "find AI trends this week")`
- System creates a temporary AdClawAgent with researcher's SOUL.md, LLM, skills
- Executes the task, returns result to coordinator
- Coordinator formats and sends final response to user
- User sees coordinator's response (may include "Researcher found: ...")

## Shared Memory

Agents can read/write to a shared directory: `/app/working/shared/`

```
/app/working/shared/
├── researcher/
│   ├── daily-intel-2026-03-09.md
│   └── latest.md
├── content/
│   ├── drafts/
│   └── published/
└── coordinator/
    └── weekly-summary.md
```

- Each agent has read access to ALL shared dirs
- Each agent has write access to its own dir only
- Built-in tools: `read_shared_file(agent_id, filename)`, `write_shared_file(filename, content)`

### Dual Memory per Agent

Each persona uses **both** memory systems:

| System | What it does | Scope |
|--------|-------------|-------|
| **ReMe** (file-based, ReMeCopaw) | Conversation compaction, MEMORY.md, session memory | Per-agent: `/app/working/agents/{agent_id}/` |
| **AOM** (vector/embeddings) | Semantic search, long-term knowledge, auto-capture | Shared across all agents (single DB) |

**ReMe per agent:**
- Each persona gets its own `working_dir`: `/app/working/agents/{agent_id}/`
- Contains: `MEMORY.md`, `memory/` dir, session compaction files
- Agent writes only to its own ReMe; can read others via shared files
- `MemoryManager` instance created per-agent with agent-specific working_dir

**AOM shared:**
- Single AOM database for all agents (existing behavior)
- Memories tagged with `agent_id` metadata for filtering
- Query: agent sees all AOM memories, but can filter by `agent_id`
- Capture: each agent's conversations auto-captured with its `agent_id` tag

**Why dual:** ReMe handles conversation flow and compaction (per-agent context).
AOM handles cross-agent knowledge discovery (semantic search across everything).

## Prompt Building Changes

Current: `PromptBuilder` reads `AGENTS.md + SOUL.md + PROFILE.md` from working dir.

New: When a persona is active:
1. `AGENTS.md` — same (shared rules and workflows)
2. `SOUL.md` — replaced with persona's `soul_md` from config
3. `PROFILE.md` — same (user identity)
4. **Injected section**: list of other personas (name + role) so agent knows the team
5. **Injected section**: available shared files index

## REST API

```
GET    /api/agents/personas              — list all personas
POST   /api/agents/personas              — create persona
GET    /api/agents/personas/{id}         — get persona
PUT    /api/agents/personas/{id}         — update persona
DELETE /api/agents/personas/{id}         — delete persona
POST   /api/agents/personas/{id}/test    — send test prompt, get response
GET    /api/agents/shared/{id}           — list shared files for persona
```

## Web UI

### Agents Page (`/agents`)

**List view:** Cards grid, each card shows:
- Name + avatar (auto-generated from initials or emoji)
- SOUL.md preview (first 2 lines)
- LLM badge (provider + model)
- Skills count + MCP count
- Cron status (enabled/disabled + schedule)
- Coordinator badge if applicable
- Edit / Delete actions

**Create/Edit form:**
- Name (text input)
- ID (auto-slug from name, editable)
- SOUL.md (markdown textarea, full height)
- LLM: provider dropdown + model dropdown (from existing providers)
- Skills: multi-select checklist from installed skills
- MCP Clients: multi-select checklist from configured MCPs
- Is Coordinator: toggle
- Cron: enable toggle + schedule input + prompt textarea + output dropdown

### Preset Templates (button "Create from template"):

| Template | LLM | Skills | MCP | SOUL Summary |
|----------|-----|--------|-----|---|
| Researcher | cheapest available | exa_search, trend_analysis | brave_search, xai_search | Systematic researcher, facts only, structured reports |
| Content Writer | default model | content_writing, copywriting | citedy | Creative writer, adapts to brand voice |
| SEO Specialist | default model | seo_* (11 skills) | citedy | Technical SEO expert, data-driven |
| Ads Manager | default model | ads_* (12 skills) | — | Performance marketer, ROI-focused |
| Social Media | cheapest available | social_* (5 skills) | xai_search | Trend-aware, platform-native voice |

## Safety & Security

- **Skill scanner**: runs on SOUL.md content (reuse existing 208-pattern scanner)
- **Memory sanitizer**: applied to shared files (reuse existing 33-pattern sanitizer)
- **Delegation loop prevention**: max delegation depth = 3
- **Concurrent execution**: mutex per agent_id to prevent parallel runs of same agent
- **SOUL.md size limit**: 10,000 chars (fits in context window with room for tools)

## Migration

- Zero breaking changes: if `agents.personas` is empty/missing, system works exactly as today
- Current SOUL.md in working dir = the default agent (becomes coordinator)
- Existing cron jobs unaffected
- Existing sessions unaffected

## Non-Goals (MVP)

- Agent-to-agent direct messaging (beyond coordinator delegation)
- Per-agent AOM instances (shared AOM with agent_id tags is sufficient)
- Agent marketplace / import-export
- Voice/personality for different channels (same persona everywhere)
- Custom avatars upload (auto-generated only)
