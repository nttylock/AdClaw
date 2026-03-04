# CLI

`adclaw` is the command-line tool for AdClaw. This page is organized from
"get-up-and-running" to "advanced management" — read from top to bottom if
you're new, or jump to the section you need.

> Not sure what "channels", "heartbeat", or "cron" mean? See
> [Introduction](./intro) first.

---

## Getting started

These are the commands you'll use on day one.

### adclaw init

First-time setup. Walks you through configuration interactively.

```bash
adclaw init              # Interactive setup (recommended for first time)
adclaw init --defaults   # Non-interactive, use all defaults (good for scripts)
adclaw init --force      # Overwrite existing config files
```

**What the interactive flow covers (in order):**

1. **Heartbeat** — interval (e.g. `30m`), target (`main` / `last`), optional
   active hours.
2. **Show tool details** — whether tool call details appear in channel messages.
3. **Language** — `zh` or `en` for agent persona files (SOUL.md, etc.).
4. **Channels** — optionally configure iMessage / Discord / DingTalk / Feishu /
   QQ / Console.
5. **LLM provider** — select provider, enter API key, choose model (**required**).
6. **Skills** — enable all / none / custom selection.
7. **Environment variables** — optionally add key-value pairs for tools.
8. **HEARTBEAT.md** — edit the heartbeat checklist in your default editor.

### adclaw app

Start the AdClaw server. Everything else — channels, cron jobs, the Console
UI — depends on this.

```bash
adclaw app                             # Start on 127.0.0.1:8088
adclaw app --host 0.0.0.0 --port 9090 # Custom address
adclaw app --reload                    # Auto-reload on code change (dev)
adclaw app --workers 4                 # Multi-worker mode
adclaw app --log-level debug           # Verbose logging
```

| Option        | Default     | Description                                                   |
| ------------- | ----------- | ------------------------------------------------------------- |
| `--host`      | `127.0.0.1` | Bind host                                                     |
| `--port`      | `8088`      | Bind port                                                     |
| `--reload`    | off         | Auto-reload on file changes (dev only)                        |
| `--workers`   | `1`         | Number of worker processes                                    |
| `--log-level` | `info`      | `critical` / `error` / `warning` / `info` / `debug` / `trace` |

### Console

Once `adclaw app` is running, open `http://127.0.0.1:8088/` in your browser to
access the **Console** — a web UI for chat, channels, cron, skills, models,
and more. See [Console](./console) for a full walkthrough.

If the frontend was not built, the root URL returns a JSON message like `{"message": "AdClaw Web Console is not available."}` but the API still works.

**To build the frontend:** in the project's `console/` directory run
`npm ci && npm run build` (output in `src/adclaw/console/`). Docker images and pip
packages already include the Console.

---

## Models & environment variables

Before using AdClaw you need at least one LLM provider configured. Environment
variables power many built-in tools (e.g. web search).

### adclaw models

Manage LLM providers and the active model.

| Command                                | What it does                                         |
| -------------------------------------- | ---------------------------------------------------- |
| `adclaw models list`                    | Show all providers, API key status, and active model |
| `adclaw models config`                  | Full interactive setup: API keys → active model      |
| `adclaw models config-key [provider]`   | Configure a single provider's API key                |
| `adclaw models set-llm`                 | Switch the active model (API keys unchanged)         |
| `adclaw models download <repo_id>`      | Download a local model (llama.cpp / MLX)             |
| `adclaw models local`                   | List downloaded local models                         |
| `adclaw models remove-local <model_id>` | Delete a downloaded local model                      |
| `adclaw models ollama-pull <model>`     | Download an Ollama model                             |
| `adclaw models ollama-list`             | List Ollama models                                   |
| `adclaw models ollama-remove <model>`   | Delete an Ollama model                               |

```bash
adclaw models list                    # See what's configured
adclaw models config                  # Full interactive setup
adclaw models config-key modelscope   # Just set ModelScope's API key
adclaw models config-key dashscope    # Just set DashScope's API key
adclaw models config-key custom       # Set custom provider (Base URL + key)
adclaw models set-llm                 # Change active model only
```

#### Local models

AdClaw can also run models locally via llama.cpp or MLX — no API key needed.
Install the backend first: `pip install 'adclaw[llamacpp]'` or
`pip install 'adclaw[mlx]'`.

```bash
# Download a model (auto-selects Q4_K_M GGUF)
adclaw models download Qwen/Qwen3-4B-GGUF

# Download an MLX model
adclaw models download Qwen/Qwen3-4B --backend mlx

# Download from ModelScope
adclaw models download Qwen/Qwen2-0.5B-Instruct-GGUF --source modelscope

# List downloaded models
adclaw models local
adclaw models local --backend mlx

# Delete a downloaded model
adclaw models remove-local <model_id>
adclaw models remove-local <model_id> --yes   # skip confirmation
```

| Option      | Short | Default       | Description                                                           |
| ----------- | ----- | ------------- | --------------------------------------------------------------------- |
| `--backend` | `-b`  | `llamacpp`    | Target backend (`llamacpp` or `mlx`)                                  |
| `--source`  | `-s`  | `huggingface` | Download source (`huggingface` or `modelscope`)                       |
| `--file`    | `-f`  | _(auto)_      | Specific filename. If omitted, auto-selects (prefers Q4_K_M for GGUF) |

#### Ollama models

AdClaw integrates with Ollama to run models locally. Models are dynamically loaded from your Ollama daemon — install Ollama first from [ollama.com](https://ollama.com).

Install the Ollama SDK: `pip install 'adclaw[ollama]'` (or re-run the installer with `--extras ollama`)

```bash
# Download an Ollama model
adclaw models ollama-pull mistral:7b
adclaw models ollama-pull qwen3:8b

# List Ollama models
adclaw models ollama-list

# Remove an Ollama model
adclaw models ollama-remove mistral:7b
adclaw models ollama-remove qwen3:8b --yes   # skip confirmation

# Use in config flow (auto-detects Ollama models)
adclaw models config           # Select Ollama → Choose from model list
adclaw models set-llm          # Switch to a different Ollama model
```

**Key differences from local models:**

- Models come from Ollama daemon (not downloaded by AdClaw)
- Use `ollama-pull` / `ollama-remove` instead of `download` / `remove-local`
- Model list updates dynamically when you add/remove via Ollama CLI or AdClaw

> **Note:** You are responsible for ensuring the API key is valid. AdClaw does
> not verify key correctness. See [Config — LLM Providers](./config#llm-providers).

### adclaw env

Manage environment variables used by tools and skills at runtime.

| Command                   | What it does                  |
| ------------------------- | ----------------------------- |
| `adclaw env list`          | List all configured variables |
| `adclaw env set KEY VALUE` | Set or update a variable      |
| `adclaw env delete KEY`    | Delete a variable             |

```bash
adclaw env list
adclaw env set TAVILY_API_KEY "tvly-xxxxxxxx"
adclaw env set GITHUB_TOKEN "ghp_xxxxxxxx"
adclaw env delete TAVILY_API_KEY
```

> **Note:** AdClaw only stores and loads these values; you are responsible for
> ensuring they are correct. See
> [Config — Environment Variables](./config#environment-variables).

---

## Channels

Connect AdClaw to messaging platforms.

### adclaw channels

Manage channel configuration (iMessage, Discord, DingTalk, Feishu, QQ,
Console, etc.). **Note:** Use `config` for interactive setup (no `configure`
subcommand); use `remove` to uninstall custom channels (no `uninstall`).

| Command                        | What it does                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `adclaw channels list`          | Show all channels and their status (secrets masked)                                                               |
| `adclaw channels install <key>` | Install a channel into `custom_channels/`: create stub or use `--path`/`--url`                                    |
| `adclaw channels add <key>`     | Install and add to config; built-in channels only get config entry; supports `--path`/`--url`                     |
| `adclaw channels remove <key>`  | Remove a custom channel from `custom_channels/` (built-ins cannot be removed); `--keep-config` keeps config entry |
| `adclaw channels config`        | Interactively enable/disable channels and fill in credentials                                                     |

```bash
adclaw channels list                    # See current status
adclaw channels install my_channel      # Create custom channel stub
adclaw channels install my_channel --path ./my_channel.py
adclaw channels add dingtalk            # Add DingTalk to config
adclaw channels remove my_channel       # Remove custom channel (and from config by default)
adclaw channels remove my_channel --keep-config   # Remove module only, keep config entry
adclaw channels config                 # Interactive configuration
```

The interactive `config` flow lets you pick a channel, enable/disable it, and enter credentials. It loops until you choose "Save and exit".

| Channel      | Fields to fill in                             |
| ------------ | --------------------------------------------- |
| **iMessage** | Bot prefix, database path, poll interval      |
| **Discord**  | Bot prefix, Bot Token, HTTP proxy, proxy auth |
| **DingTalk** | Bot prefix, Client ID, Client Secret          |
| **Feishu**   | Bot prefix, App ID, App Secret                |
| **QQ**       | Bot prefix, App ID, Client Secret             |
| **Console**  | Bot prefix                                    |

> For platform-specific credential setup, see [Channels](./channels).

---

## Cron (scheduled tasks)

Create jobs that run on a timed schedule — "every day at 9am", "every 2 hours
ask AdClaw and send the reply". **Requires `adclaw app` to be running.**

### adclaw cron

| Command                      | What it does                                  |
| ---------------------------- | --------------------------------------------- |
| `adclaw cron list`            | List all jobs                                 |
| `adclaw cron get <job_id>`    | Show a job's spec                             |
| `adclaw cron state <job_id>`  | Show runtime state (next run, last run, etc.) |
| `adclaw cron create ...`      | Create a job                                  |
| `adclaw cron delete <job_id>` | Delete a job                                  |
| `adclaw cron pause <job_id>`  | Pause a job                                   |
| `adclaw cron resume <job_id>` | Resume a paused job                           |
| `adclaw cron run <job_id>`    | Run once immediately                          |

### Creating jobs

**Option 1 — CLI arguments (simple jobs)**

Two task types:

- **text** — send a fixed message to a channel on schedule.
- **agent** — ask AdClaw a question on schedule and deliver the reply.

```bash
# Text: send "Good morning!" to DingTalk every day at 9:00
adclaw cron create \
  --type text \
  --name "Daily 9am" \
  --cron "0 9 * * *" \
  --channel dingtalk \
  --target-user "your_user_id" \
  --target-session "session_id" \
  --text "Good morning!"

# Agent: every 2 hours, ask AdClaw and forward the reply
adclaw cron create \
  --type agent \
  --name "Check todos" \
  --cron "0 */2 * * *" \
  --channel dingtalk \
  --target-user "your_user_id" \
  --target-session "session_id" \
  --text "What are my todo items?"
```

Required: `--type`, `--name`, `--cron`, `--channel`, `--target-user`,
`--target-session`, `--text`.

**Option 2 — JSON file (complex or batch)**

```bash
adclaw cron create -f job_spec.json
```

JSON structure matches the output of `adclaw cron get <job_id>`.

### Additional options

| Option                       | Default | Description                                           |
| ---------------------------- | ------- | ----------------------------------------------------- |
| `--timezone`                 | `UTC`   | Timezone for the cron schedule                        |
| `--enabled` / `--no-enabled` | enabled | Create enabled or disabled                            |
| `--mode`                     | `final` | `stream` (incremental) or `final` (complete response) |
| `--base-url`                 | auto    | Override the API base URL                             |

### Cron expression cheat sheet

Five fields: **minute hour day month weekday** (no seconds).

| Expression     | Meaning                   |
| -------------- | ------------------------- |
| `0 9 * * *`    | Every day at 9:00         |
| `0 */2 * * *`  | Every 2 hours on the hour |
| `30 8 * * 1-5` | Weekdays at 8:30          |
| `0 0 * * 0`    | Sunday at midnight        |
| `*/15 * * * *` | Every 15 minutes          |

---

## Chats (sessions)

Manage chat sessions via the API. **Requires `adclaw app` to be running.**

### adclaw chats

| Command                                | What it does                                                  |
| -------------------------------------- | ------------------------------------------------------------- |
| `adclaw chats list`                     | List all sessions (supports `--user-id`, `--channel` filters) |
| `adclaw chats get <id>`                 | View a session's details and message history                  |
| `adclaw chats create ...`               | Create a new session                                          |
| `adclaw chats update <id> --name "..."` | Rename a session                                              |
| `adclaw chats delete <id>`              | Delete a session                                              |

```bash
adclaw chats list
adclaw chats list --user-id alice --channel dingtalk
adclaw chats get 823845fe-dd13-43c2-ab8b-d05870602fd8
adclaw chats create --session-id "discord:alice" --user-id alice --name "My Chat"
adclaw chats create -f chat.json
adclaw chats update <chat_id> --name "Renamed"
adclaw chats delete <chat_id>
```

---

## Skills

Extend AdClaw's capabilities with skills (PDF reading, web search, etc.).

### adclaw skills

| Command               | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `adclaw skills list`   | Show all skills and their enabled/disabled status |
| `adclaw skills config` | Interactively enable/disable skills (checkbox UI) |

```bash
adclaw skills list     # See what's available
adclaw skills config   # Toggle skills on/off interactively
```

In the interactive UI: ↑/↓ to navigate, Space to toggle, Enter to confirm.
A preview of changes is shown before applying.

> For built-in skill details and custom skill authoring, see [Skills](./skills).

---

## Maintenance

### adclaw clean

Remove everything under the working directory (default `~/.adclaw`).

```bash
adclaw clean             # Interactive confirmation
adclaw clean --yes       # No confirmation
adclaw clean --dry-run   # Only list what would be removed
```

---

## Global options

Every `adclaw` subcommand inherits:

| Option          | Default     | Description                                    |
| --------------- | ----------- | ---------------------------------------------- |
| `--host`        | `127.0.0.1` | API host (auto-detected from last `adclaw app`) |
| `--port`        | `8088`      | API port (auto-detected from last `adclaw app`) |
| `-h` / `--help` |             | Show help message                              |

If the server runs on a non-default address, pass these globally:

```bash
adclaw --host 0.0.0.0 --port 9090 cron list
```

## Working directory

All config and data live in `~/.adclaw` by default: `config.json`,
`HEARTBEAT.md`, `jobs.json`, `chats.json`, skills, memory, and agent persona
files.

| Variable            | Description                         |
| ------------------- | ----------------------------------- |
| `ADCLAW_WORKING_DIR` | Override the working directory path |
| `ADCLAW_CONFIG_FILE` | Override the config file path       |

See [Config & Working Directory](./config) for full details.

---

## Command overview

| Command          | Subcommands                                                                                                                            | Requires server? |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | :--------------: |
| `adclaw init`     | —                                                                                                                                      |        No        |
| `adclaw app`      | —                                                                                                                                      |  — (starts it)   |
| `adclaw models`   | `list` · `config` · `config-key` · `set-llm` · `download` · `local` · `remove-local` · `ollama-pull` · `ollama-list` · `ollama-remove` |        No        |
| `adclaw env`      | `list` · `set` · `delete`                                                                                                              |        No        |
| `adclaw channels` | `list` · `install` · `add` · `remove` · `config`                                                                                       |        No        |
| `adclaw cron`     | `list` · `get` · `state` · `create` · `delete` · `pause` · `resume` · `run`                                                            |     **Yes**      |
| `adclaw chats`    | `list` · `get` · `create` · `update` · `delete`                                                                                        |     **Yes**      |
| `adclaw skills`   | `list` · `config`                                                                                                                      |        No        |
| `adclaw clean`    | —                                                                                                                                      |        No        |

---

## Related pages

- [Introduction](./intro) — What AdClaw can do
- [Console](./console) — Web-based management UI
- [Channels](./channels) — DingTalk, Feishu, iMessage, Discord, QQ setup
- [Heartbeat](./heartbeat) — Scheduled check-in / digest
- [Skills](./skills) — Built-in and custom skills
- [Config & Working Directory](./config) — Working directory and config.json
