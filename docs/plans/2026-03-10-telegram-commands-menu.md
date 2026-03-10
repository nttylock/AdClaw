# Telegram Bot Commands & Persistent Menu

## Goal
Add interactive commands with inline keyboards to the Telegram bot,
giving users quick access to personas, model switching, skills overview,
and status — all without typing.

## Persistent Reply Keyboard (always visible)

```
[👤 Persona] [⚙️ Model] [🆕 New Chat]
[🔧 Skills]  [📊 Status]
```

Implemented as `ReplyKeyboardMarkup(resize_keyboard=True)`, sent once
on `/start` and persisted by Telegram.

---

## Commands

### 1. `/personas` (👤 Persona button)
- Fetch personas dynamically from config (`PersonaManager.all_personas`)
- Show inline keyboard: one button per persona, with emoji + name
- Current active persona marked with ✓
- Button press → set sticky routing for this chat session
- "Default (Coordinator)" always last

```
🎭 Choose a persona:
[📝 Mira — Content Writer]
[📊 Alex — Analytics Reporter]
[🚀 Growth — Growth Hacker]
[🔙 Default (Coordinator)]
```

**Callback data**: `persona::{persona_id}`

### 2. `/model` (⚙️ Model button)
- Two-level inline keyboard
- **Level 1**: List configured providers (from `/api/models/providers`)
- **Level 2**: Models for selected provider, active model marked ✓
- Button press → `PUT /api/models/active` to switch

```
⚙️ Select provider:
[Aliyun] [OpenAI] [xAI]

→ tap Aliyun:
[qwen3.5-plus ✓] [qwen-max] [qwen-turbo]
```

**Callback data**: `provider::{id}` and `model::{provider_id}::{model_id}`

### 3. `/new` (🆕 New Chat button)
- Already implemented as command
- Add confirmation inline keyboard: `[Yes, reset] [Cancel]`
- On confirm → clear session, send "New chat started"

**Callback data**: `confirm_new::yes` / `confirm_new::no`

### 4. `/skills` (🔧 Skills button)
- Fetch skills list from API (or current persona's skills)
- Show as formatted message with emoji indicators:
  - 🟢 active, 🔴 disabled
  - Security score badge if available
- Informational only (v1), toggle on/off in v2

```
🔧 Active Skills (12):
🟢 seo-audit (100/100)
🟢 content-writer (95/100)
🟢 trend-researcher (100/100)
...
```

### 5. `/status` (📊 Status button)
- Single message with current state:

```
📊 Current Status
├ Persona: Mira (Content Writer)
├ Model: qwen3.5-plus (Aliyun)
├ Skills: 12 active
├ Memory: 3.2k tokens compressed
└ Session: 14 messages
```

---

## Implementation Tasks

### Task 1: Persistent Reply Keyboard
- **File**: `telegram/channel.py`
- After `/start` response, send `ReplyKeyboardMarkup` with 5 buttons
- Map button text to commands in message handler

### Task 2: `/personas` command + inline keyboard
- **Files**: `telegram/channel.py`, `command_handler.py`
- Add `PersonaManager` access to Telegram channel
- Build dynamic inline keyboard from personas list
- Handle `persona::*` callback → update session routing
- Store persona selection per chat_id (persistent across restarts)

### Task 3: `/model` command + two-level inline keyboard
- **Files**: `telegram/channel.py`, `command_handler.py`
- Fetch providers/models from API or config
- Level 1: provider buttons
- Level 2: model buttons with ✓ on active
- Handle `model::*` callback → `PUT /api/models/active`

### Task 4: `/new` with confirmation
- **File**: `telegram/channel.py`
- Intercept `/new` → show confirm keyboard
- Handle `confirm_new::yes` → execute clear

### Task 5: `/skills` informational command
- **Files**: `telegram/channel.py`, `command_handler.py`
- Fetch skills list + security scores
- Format as readable message

### Task 6: `/status` command
- **Files**: `telegram/channel.py`, `command_handler.py`
- Aggregate: active persona, active model, skill count, memory stats
- Format as single message

### Task 7: Register all commands with BotFather
- Update `set_my_commands` with full list:
  - `/start` — Start conversation
  - `/personas` — Switch persona
  - `/model` — Switch LLM model
  - `/new` — New conversation
  - `/skills` — View active skills
  - `/status` — Current status
  - `/compact` — Compact memory
  - `/clear` — Clear all history
  - `/history` — Show history

### Task 8: Test & Deploy
- Test each command in Telegram
- Verify persistent keyboard appears
- Verify inline keyboards work
- Verify persona switching persists
- Verify model switching applies

---

## Technical Notes

- `CallbackQueryHandler` already exists — extend `handle_callback_query`
- Persona routing already implemented (`PersonaManager.resolve_tag`)
- Model API already exists (`PUT /api/models/active`)
- Skills API already exists (`GET /api/skills`)
- Diagnostics health API can provide status data

## Priority
1. Task 1 (keyboard) + Task 2 (personas) — highest impact
2. Task 3 (model) — second priority
3. Tasks 4-7 — follow-up
