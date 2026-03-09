# Multi-Agent Personas — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-agent personas to AdClaw — each persona has its own SOUL.md, LLM, skills, MCP clients. Users @tag agents in Telegram; coordinator delegates automatically.

**Architecture:** Single AdClaw instance, multiple persona configs in `config.json → agents.personas[]`. `AgentRunner.query_handler()` selects persona by @tag routing, creates `AdClawAgent` with persona-specific SOUL, model, skills, MCP. Coordinator (default persona) can delegate via `delegate_to_agent` tool. Each persona has its own ReMe working dir; AOM is shared with `agent_id` tags.

**Tech Stack:** Python 3.11, FastAPI, Pydantic, AgentScope, APScheduler, React 18 + TypeScript + Ant Design 5

---

## Task 1: Persona Config Model

**Files:**
- Modify: `/root/AdClaw/src/adclaw/config/config.py`
- Create: `/root/AdClaw/tests/test_persona_config.py`

**Step 1: Write the failing test**

```python
# tests/test_persona_config.py
import pytest
from adclaw.config.config import PersonaConfig, AgentsConfig, Config


class TestPersonaConfig:
    def test_persona_defaults(self):
        p = PersonaConfig(id="researcher", name="Researcher")
        assert p.id == "researcher"
        assert p.name == "Researcher"
        assert p.soul_md == ""
        assert p.model_provider == ""
        assert p.model_name == ""
        assert p.skills == []
        assert p.mcp_clients == []
        assert p.is_coordinator is False
        assert p.cron is None

    def test_persona_with_cron(self):
        p = PersonaConfig(
            id="news",
            name="News Agent",
            soul_md="## Role\nYou find news.",
            cron=PersonaCronConfig(
                enabled=True,
                schedule="0 8 * * *",
                prompt="Find trending news",
                output="both",
            ),
        )
        assert p.cron.enabled is True
        assert p.cron.output == "both"

    def test_agents_config_empty_personas(self):
        ac = AgentsConfig()
        assert ac.personas == []

    def test_agents_config_with_personas(self):
        ac = AgentsConfig(
            personas=[
                PersonaConfig(id="r", name="R"),
                PersonaConfig(id="c", name="C", is_coordinator=True),
            ]
        )
        assert len(ac.personas) == 2

    def test_config_round_trip(self):
        """Config with personas serializes and deserializes correctly."""
        cfg = Config(
            agents=AgentsConfig(
                personas=[
                    PersonaConfig(
                        id="test",
                        name="Test",
                        soul_md="Be helpful.",
                        model_provider="aliyun-intl",
                        model_name="qwen3.5-plus",
                    )
                ]
            )
        )
        data = cfg.model_dump()
        cfg2 = Config(**data)
        assert len(cfg2.agents.personas) == 1
        assert cfg2.agents.personas[0].soul_md == "Be helpful."

    def test_persona_id_validation(self):
        """ID must be alphanumeric + hyphens + underscores."""
        with pytest.raises(Exception):
            PersonaConfig(id="bad id!", name="Bad")

    def test_only_one_coordinator(self):
        """AgentsConfig validates max one coordinator."""
        from adclaw.config.config import validate_single_coordinator
        personas = [
            PersonaConfig(id="a", name="A", is_coordinator=True),
            PersonaConfig(id="b", name="B", is_coordinator=True),
        ]
        with pytest.raises(ValueError):
            validate_single_coordinator(personas)
```

**Step 2: Run test to verify it fails**

Run: `cd /root/AdClaw && python -m pytest tests/test_persona_config.py -v`
Expected: FAIL — `PersonaConfig` not defined

**Step 3: Write implementation**

Add to `src/adclaw/config/config.py`:

```python
import re

class PersonaCronConfig(BaseModel):
    """Cron configuration for a persona."""
    enabled: bool = False
    schedule: str = ""  # cron expression e.g. "0 8,14,20 * * *"
    prompt: str = ""
    output: str = "chat"  # "chat" | "file" | "both"

class PersonaConfig(BaseModel):
    """Configuration for a single agent persona."""
    id: str  # unique slug, used as @tag
    name: str  # display name
    soul_md: str = ""  # SOUL.md content
    model_provider: str = ""  # empty = use default
    model_name: str = ""  # empty = use default
    skills: list[str] = []  # empty = all skills
    mcp_clients: list[str] = []  # empty = all MCP clients
    is_coordinator: bool = False
    cron: PersonaCronConfig | None = None

    @field_validator("id")
    @classmethod
    def validate_id(cls, v):
        if not re.match(r'^[a-z0-9_-]+$', v):
            raise ValueError(f"Persona ID must be lowercase alphanumeric, hyphens, underscores: {v}")
        return v

def validate_single_coordinator(personas: list[PersonaConfig]) -> None:
    coordinators = [p for p in personas if p.is_coordinator]
    if len(coordinators) > 1:
        raise ValueError(f"Only one coordinator allowed, found: {[c.id for c in coordinators]}")
```

Add `personas: list[PersonaConfig] = []` to `AgentsConfig`.

**Step 4: Run test to verify it passes**

Run: `cd /root/AdClaw && python -m pytest tests/test_persona_config.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/adclaw/config/config.py tests/test_persona_config.py
git commit -m "feat: add PersonaConfig model to config"
```

---

## Task 2: Persona Working Directories & ReMe Isolation

**Files:**
- Create: `/root/AdClaw/src/adclaw/agents/persona_manager.py`
- Create: `/root/AdClaw/tests/test_persona_manager.py`

**Step 1: Write the failing test**

```python
# tests/test_persona_manager.py
import os
import pytest
import tempfile
from adclaw.agents.persona_manager import PersonaManager
from adclaw.config.config import PersonaConfig


class TestPersonaManager:
    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()
        self.personas = [
            PersonaConfig(id="researcher", name="Researcher", soul_md="## Research\nFind facts."),
            PersonaConfig(id="content", name="Content Writer", soul_md="## Writer\nCreate content."),
            PersonaConfig(id="coordinator", name="Coordinator", is_coordinator=True),
        ]
        self.manager = PersonaManager(working_dir=self.tmpdir, personas=self.personas)

    def test_init_creates_dirs(self):
        self.manager.ensure_dirs()
        assert os.path.isdir(os.path.join(self.tmpdir, "agents", "researcher"))
        assert os.path.isdir(os.path.join(self.tmpdir, "agents", "content"))
        assert os.path.isdir(os.path.join(self.tmpdir, "agents", "researcher", "memory"))
        assert os.path.isdir(os.path.join(self.tmpdir, "shared", "researcher"))

    def test_get_persona_by_id(self):
        p = self.manager.get_persona("researcher")
        assert p.name == "Researcher"

    def test_get_persona_not_found(self):
        assert self.manager.get_persona("nonexistent") is None

    def test_get_coordinator(self):
        c = self.manager.get_coordinator()
        assert c.id == "coordinator"

    def test_get_coordinator_none(self):
        mgr = PersonaManager(working_dir=self.tmpdir, personas=[
            PersonaConfig(id="a", name="A"),
        ])
        assert mgr.get_coordinator() is None

    def test_get_working_dir_for_persona(self):
        d = self.manager.get_working_dir("researcher")
        assert d.endswith("agents/researcher")

    def test_get_shared_dir_for_persona(self):
        d = self.manager.get_shared_dir("researcher")
        assert d.endswith("shared/researcher")

    def test_resolve_tag_from_message(self):
        persona_id = self.manager.resolve_tag("@researcher найди тренды AI")
        assert persona_id == "researcher"

    def test_resolve_tag_no_tag(self):
        persona_id = self.manager.resolve_tag("просто сообщение")
        assert persona_id is None

    def test_resolve_tag_unknown(self):
        persona_id = self.manager.resolve_tag("@unknown что-то")
        assert persona_id is None

    def test_strip_tag_from_message(self):
        text = self.manager.strip_tag("@researcher найди тренды AI")
        assert text == "найди тренды AI"

    def test_list_all_personas_summary(self):
        """Returns summary for prompt injection (team awareness)."""
        summary = self.manager.get_team_summary()
        assert "researcher" in summary
        assert "Content Writer" in summary

    def test_list_shared_files(self):
        self.manager.ensure_dirs()
        # Write a file to researcher's shared dir
        shared = self.manager.get_shared_dir("researcher")
        with open(os.path.join(shared, "report.md"), "w") as f:
            f.write("# Report")
        files = self.manager.list_shared_files("researcher")
        assert "report.md" in files
```

**Step 2: Run test to verify it fails**

Run: `cd /root/AdClaw && python -m pytest tests/test_persona_manager.py -v`
Expected: FAIL — `PersonaManager` not defined

**Step 3: Write implementation**

```python
# src/adclaw/agents/persona_manager.py
import os
import re
import logging
from pathlib import Path
from typing import Optional
from ..config.config import PersonaConfig

logger = logging.getLogger(__name__)


class PersonaManager:
    """Manages agent personas — working dirs, routing, shared files."""

    def __init__(self, working_dir: str, personas: list[PersonaConfig]):
        self.working_dir = Path(working_dir)
        self._personas = {p.id: p for p in personas}

    def ensure_dirs(self) -> None:
        """Create working directories for all personas."""
        for pid in self._personas:
            agent_dir = self.working_dir / "agents" / pid
            (agent_dir / "memory").mkdir(parents=True, exist_ok=True)
            shared_dir = self.working_dir / "shared" / pid
            shared_dir.mkdir(parents=True, exist_ok=True)

    def get_persona(self, persona_id: str) -> Optional[PersonaConfig]:
        return self._personas.get(persona_id)

    def get_coordinator(self) -> Optional[PersonaConfig]:
        for p in self._personas.values():
            if p.is_coordinator:
                return p
        return None

    def get_working_dir(self, persona_id: str) -> str:
        return str(self.working_dir / "agents" / persona_id)

    def get_shared_dir(self, persona_id: str) -> str:
        return str(self.working_dir / "shared" / persona_id)

    def resolve_tag(self, text: str) -> Optional[str]:
        """Extract @persona_id from message start. Returns None if no valid tag."""
        match = re.match(r'^@([a-z0-9_-]+)\s', text)
        if match:
            tag = match.group(1)
            if tag in self._personas:
                return tag
        return None

    def strip_tag(self, text: str) -> str:
        """Remove @tag from message start."""
        return re.sub(r'^@[a-z0-9_-]+\s+', '', text)

    def get_team_summary(self) -> str:
        """Generate team summary for prompt injection."""
        lines = ["## Your Team\n"]
        for p in self._personas.values():
            role = p.soul_md.split('\n')[0] if p.soul_md else "No role defined"
            coord = " (coordinator)" if p.is_coordinator else ""
            lines.append(f"- **@{p.id}** ({p.name}){coord}: {role}")
        return "\n".join(lines)

    def list_shared_files(self, persona_id: str) -> list[str]:
        shared = Path(self.get_shared_dir(persona_id))
        if not shared.exists():
            return []
        return [f.name for f in shared.iterdir() if f.is_file()]

    @property
    def all_personas(self) -> list[PersonaConfig]:
        return list(self._personas.values())
```

**Step 4: Run test to verify it passes**

Run: `cd /root/AdClaw && python -m pytest tests/test_persona_manager.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/persona_manager.py tests/test_persona_manager.py
git commit -m "feat: add PersonaManager for working dirs, routing, shared files"
```

---

## Task 3: PromptBuilder — Persona-Aware

**Files:**
- Modify: `/root/AdClaw/src/adclaw/agents/prompt.py`
- Create: `/root/AdClaw/tests/test_prompt_persona.py`

**Step 1: Write the failing test**

```python
# tests/test_prompt_persona.py
import os
import tempfile
import pytest
from adclaw.agents.prompt import PromptBuilder
from adclaw.config.config import PersonaConfig


class TestPromptBuilderPersona:
    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()
        # Create required files
        with open(os.path.join(self.tmpdir, "AGENTS.md"), "w") as f:
            f.write("## Rules\nFollow instructions.")
        with open(os.path.join(self.tmpdir, "SOUL.md"), "w") as f:
            f.write("## Default Soul\nBe helpful.")
        with open(os.path.join(self.tmpdir, "PROFILE.md"), "w") as f:
            f.write("## Profile\nUser: test")

    def test_default_build_unchanged(self):
        """Without persona, builds from files as before."""
        builder = PromptBuilder(working_dir=self.tmpdir)
        prompt = builder.build()
        assert "Default Soul" in prompt
        assert "AGENTS.md" in prompt

    def test_persona_overrides_soul(self):
        """With persona, SOUL.md is replaced by persona's soul_md."""
        persona = PersonaConfig(
            id="researcher",
            name="Researcher",
            soul_md="## Researcher Soul\nYou find facts only.",
        )
        builder = PromptBuilder(working_dir=self.tmpdir, persona=persona)
        prompt = builder.build()
        assert "Researcher Soul" in prompt
        assert "Default Soul" not in prompt
        assert "AGENTS.md" in prompt  # AGENTS.md still included
        assert "Profile" in prompt  # PROFILE.md still included

    def test_persona_empty_soul_uses_file(self):
        """If persona soul_md is empty, falls back to SOUL.md file."""
        persona = PersonaConfig(id="test", name="Test", soul_md="")
        builder = PromptBuilder(working_dir=self.tmpdir, persona=persona)
        prompt = builder.build()
        assert "Default Soul" in prompt

    def test_team_summary_injected(self):
        """Team summary injected when team_summary is provided."""
        builder = PromptBuilder(
            working_dir=self.tmpdir,
            team_summary="## Your Team\n- @researcher: finds facts",
        )
        prompt = builder.build()
        assert "Your Team" in prompt
        assert "@researcher" in prompt
```

**Step 2: Run test to verify it fails**

Run: `cd /root/AdClaw && python -m pytest tests/test_prompt_persona.py -v`
Expected: FAIL — `PromptBuilder` doesn't accept `persona` param

**Step 3: Modify PromptBuilder**

In `src/adclaw/agents/prompt.py`, update `PromptBuilder.__init__` and `build`:

```python
class PromptBuilder:
    def __init__(self, working_dir: Path, persona=None, team_summary: str = ""):
        self.working_dir = working_dir
        self.persona = persona
        self.team_summary = team_summary
        self.prompt_parts = []
        self.loaded_count = 0

    def build(self) -> str:
        for filename, required in PromptConfig.FILE_ORDER:
            # If persona has soul_md, skip SOUL.md file and inject persona's soul
            if filename == "SOUL.md" and self.persona and self.persona.soul_md:
                self.prompt_parts.append("")
                self.prompt_parts.append(f"# SOUL.md ({self.persona.name})")
                self.prompt_parts.append("")
                self.prompt_parts.append(self.persona.soul_md)
                self.loaded_count += 1
                continue

            if not self._load_file(filename, required):
                return DEFAULT_SYS_PROMPT

        # Inject team summary if provided
        if self.team_summary:
            self.prompt_parts.append("")
            self.prompt_parts.append(self.team_summary)

        if not self.prompt_parts:
            return DEFAULT_SYS_PROMPT

        return "\n\n".join(self.prompt_parts)
```

Also update `build_system_prompt_from_working_dir` to accept optional persona and team_summary params.

**Step 4: Run test to verify it passes**

Run: `cd /root/AdClaw && python -m pytest tests/test_prompt_persona.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/prompt.py tests/test_prompt_persona.py
git commit -m "feat: PromptBuilder supports persona SOUL.md override and team summary"
```

---

## Task 4: AgentRunner — Persona Selection & Model Override

**Files:**
- Modify: `/root/AdClaw/src/adclaw/app/runner/runner.py`
- Modify: `/root/AdClaw/src/adclaw/agents/react_agent.py`
- Create: `/root/AdClaw/tests/test_runner_persona.py`

**Step 1: Write the failing test**

```python
# tests/test_runner_persona.py
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from adclaw.config.config import PersonaConfig
from adclaw.agents.persona_manager import PersonaManager


class TestRunnerPersonaRouting:
    def test_resolve_persona_with_tag(self):
        personas = [
            PersonaConfig(id="researcher", name="Researcher", soul_md="Find facts."),
            PersonaConfig(id="main", name="Main", is_coordinator=True),
        ]
        mgr = PersonaManager(working_dir="/tmp/test", personas=personas)

        pid = mgr.resolve_tag("@researcher найди тренды")
        assert pid == "researcher"

    def test_resolve_persona_no_tag_returns_none(self):
        personas = [
            PersonaConfig(id="main", name="Main", is_coordinator=True),
        ]
        mgr = PersonaManager(working_dir="/tmp/test", personas=personas)

        pid = mgr.resolve_tag("просто сообщение")
        assert pid is None

    def test_coordinator_fallback(self):
        personas = [
            PersonaConfig(id="main", name="Main", is_coordinator=True),
            PersonaConfig(id="researcher", name="Researcher"),
        ]
        mgr = PersonaManager(working_dir="/tmp/test", personas=personas)

        # No tag → coordinator
        pid = mgr.resolve_tag("что-то")
        assert pid is None
        coord = mgr.get_coordinator()
        assert coord.id == "main"
```

**Step 2: Run test — should pass (uses PersonaManager from Task 2)**

**Step 3: Modify AgentRunner**

In `runner.py`, modify `query_handler()`:

1. After loading config, create `PersonaManager` from `config.agents.personas`
2. Extract text from first message, call `persona_manager.resolve_tag(text)`
3. If tag found → get that persona; else → get coordinator; else → default (no persona)
4. If persona has `model_provider`/`model_name` → use those for `create_model_and_formatter()`
5. Strip @tag from message before passing to agent
6. Pass persona to `AdClawAgent` constructor
7. Pass team_summary to `PromptBuilder`

In `react_agent.py`, modify `AdClawAgent.__init__`:

1. Accept optional `persona: PersonaConfig` param
2. If persona has `skills` list → filter `_register_skills()` to only those
3. If persona has `mcp_clients` list → filter `register_mcp_clients()` to only those
4. Store `persona` for prompt building

Key changes in `query_handler()`:

```python
# After loading config:
persona_mgr = PersonaManager(
    working_dir=str(WORKING_DIR),
    personas=config.agents.personas,
)
persona_mgr.ensure_dirs()

# Resolve persona from message
msg_text = msgs[0].get_text_content() if msgs else ""
persona_id = persona_mgr.resolve_tag(msg_text)
persona = None

if persona_id:
    persona = persona_mgr.get_persona(persona_id)
    # Strip @tag from message
    msgs[0] = strip_tag_from_msg(msgs[0], persona_mgr)
elif persona_mgr.get_coordinator():
    persona = persona_mgr.get_coordinator()

# Override model if persona specifies one
if persona and persona.model_provider and persona.model_name:
    chat_model, formatter = create_model_and_formatter(
        provider=persona.model_provider,
        model=persona.model_name,
    )

# Create agent with persona
agent = AdClawAgent(
    env_context=env_context,
    mcp_clients=mcp_clients,  # filtered later in agent
    memory_manager=self.memory_manager,
    aom_manager=self._aom_manager,
    max_iters=max_iters,
    max_input_length=max_input_length,
    persona=persona,
    team_summary=persona_mgr.get_team_summary() if persona_mgr.all_personas else "",
)

# Session scoped per persona
if persona:
    session_id = f"{persona.id}_{session_id}"
```

**Step 4: Run tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_runner_persona.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/adclaw/app/runner/runner.py src/adclaw/agents/react_agent.py tests/test_runner_persona.py
git commit -m "feat: AgentRunner routes messages to personas via @tag"
```

---

## Task 5: Delegation Tool — `delegate_to_agent`

**Files:**
- Create: `/root/AdClaw/src/adclaw/agents/tools/delegation.py`
- Create: `/root/AdClaw/tests/test_delegation.py`

**Step 1: Write the failing test**

```python
# tests/test_delegation.py
import pytest
from adclaw.agents.tools.delegation import make_delegate_tool
from adclaw.config.config import PersonaConfig
from adclaw.agents.persona_manager import PersonaManager


class TestDelegation:
    def test_make_delegate_tool_returns_callable(self):
        personas = [
            PersonaConfig(id="researcher", name="Researcher", soul_md="Find facts."),
        ]
        mgr = PersonaManager(working_dir="/tmp/test", personas=personas)
        tool_fn = make_delegate_tool(mgr)
        assert callable(tool_fn)
        assert tool_fn.__name__ == "delegate_to_agent"

    def test_delegate_to_unknown_agent(self):
        personas = [
            PersonaConfig(id="researcher", name="Researcher", soul_md="Find facts."),
        ]
        mgr = PersonaManager(working_dir="/tmp/test", personas=personas)
        tool_fn = make_delegate_tool(mgr)
        result = tool_fn(agent_id="nonexistent", task="do something")
        assert "not found" in result.lower() or "error" in result.lower()

    def test_delegation_depth_limit(self):
        """Max delegation depth is 3."""
        from adclaw.agents.tools.delegation import DelegationContext
        ctx = DelegationContext(max_depth=3)
        assert ctx.can_delegate()
        ctx.depth = 3
        assert not ctx.can_delegate()
```

**Step 2: Run test to verify it fails**

Run: `cd /root/AdClaw && python -m pytest tests/test_delegation.py -v`
Expected: FAIL

**Step 3: Write implementation**

```python
# src/adclaw/agents/tools/delegation.py
import logging
from typing import Optional
from ..persona_manager import PersonaManager

logger = logging.getLogger(__name__)


class DelegationContext:
    """Tracks delegation depth to prevent infinite loops."""
    def __init__(self, max_depth: int = 3):
        self.max_depth = max_depth
        self.depth = 0

    def can_delegate(self) -> bool:
        return self.depth < self.max_depth


def make_delegate_tool(persona_manager: PersonaManager, delegation_ctx: Optional[DelegationContext] = None):
    """Create a delegate_to_agent tool function bound to the persona manager.

    This tool is registered on the coordinator agent so it can dispatch
    tasks to other personas.
    """
    ctx = delegation_ctx or DelegationContext()

    def delegate_to_agent(agent_id: str, task: str) -> str:
        """Delegate a task to a specific agent persona and return their response.

        Use this when a task is better handled by a specialist on your team.
        The agent will execute the task using their own skills and knowledge.

        Args:
            agent_id: The persona ID to delegate to (e.g., "researcher", "content")
            task: The task description / prompt for the agent

        Returns:
            The agent's response text
        """
        persona = persona_manager.get_persona(agent_id)
        if persona is None:
            available = [p.id for p in persona_manager.all_personas]
            return f"Error: Agent '{agent_id}' not found. Available: {available}"

        if not ctx.can_delegate():
            return f"Error: Maximum delegation depth ({ctx.max_depth}) reached. Handle this task directly."

        ctx.depth += 1
        try:
            # Import here to avoid circular deps
            from .delegation_executor import execute_delegation
            result = execute_delegation(persona, task, persona_manager)
            return result
        except Exception as e:
            logger.exception(f"Delegation to {agent_id} failed: {e}")
            return f"Error: Delegation to '{agent_id}' failed: {str(e)}"
        finally:
            ctx.depth -= 1

    return delegate_to_agent
```

**Step 4: Run tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_delegation.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/tools/delegation.py tests/test_delegation.py
git commit -m "feat: add delegate_to_agent tool for coordinator"
```

---

## Task 6: Delegation Executor — Runs Delegated Agent

**Files:**
- Create: `/root/AdClaw/src/adclaw/agents/tools/delegation_executor.py`
- Create: `/root/AdClaw/tests/test_delegation_executor.py`

**Step 1: Write the failing test**

```python
# tests/test_delegation_executor.py
import pytest
from unittest.mock import patch, MagicMock
from adclaw.agents.tools.delegation_executor import execute_delegation
from adclaw.config.config import PersonaConfig
from adclaw.agents.persona_manager import PersonaManager


class TestDelegationExecutor:
    def test_execute_creates_agent_with_persona_soul(self):
        persona = PersonaConfig(
            id="researcher",
            name="Researcher",
            soul_md="## Role\nYou are a researcher.",
        )
        mgr = PersonaManager(working_dir="/tmp/test", personas=[persona])

        with patch("adclaw.agents.tools.delegation_executor._run_agent") as mock_run:
            mock_run.return_value = "Found 3 trending topics."
            result = execute_delegation(persona, "find trends", mgr)
            assert result == "Found 3 trending topics."
            mock_run.assert_called_once()
```

**Step 2: Run test — FAIL**

**Step 3: Write implementation**

```python
# src/adclaw/agents/tools/delegation_executor.py
import asyncio
import logging
from ...config.config import PersonaConfig
from ..persona_manager import PersonaManager

logger = logging.getLogger(__name__)


def execute_delegation(persona: PersonaConfig, task: str, persona_manager: PersonaManager) -> str:
    """Execute a delegated task synchronously by creating a sub-agent.

    Creates an AdClawAgent with the persona's SOUL, runs the task,
    and returns the text response.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = pool.submit(
                    asyncio.run, _async_execute(persona, task, persona_manager)
                ).result(timeout=120)
            return result
        else:
            return asyncio.run(_async_execute(persona, task, persona_manager))
    except Exception as e:
        logger.exception(f"Delegation execution failed: {e}")
        return f"Delegation failed: {str(e)}"


async def _async_execute(persona: PersonaConfig, task: str, persona_manager: PersonaManager) -> str:
    """Async delegation execution — creates agent, runs single query."""
    return _run_agent(persona, task, persona_manager)


def _run_agent(persona: PersonaConfig, task: str, persona_manager: PersonaManager) -> str:
    """Create and run agent with persona config. Separated for testability."""
    from ..prompt import PromptBuilder
    from pathlib import Path
    from ...constant import WORKING_DIR

    # Build persona-specific prompt
    builder = PromptBuilder(
        working_dir=Path(WORKING_DIR),
        persona=persona,
        team_summary=persona_manager.get_team_summary(),
    )
    sys_prompt = builder.build()

    # For MVP: use synchronous LLM call with persona's prompt
    # Full agent creation will be added when runner supports it
    from ..model_factory import create_model_and_formatter
    if persona.model_provider and persona.model_name:
        chat_model, formatter = create_model_and_formatter(
            provider=persona.model_provider,
            model=persona.model_name,
        )
    else:
        chat_model, formatter = create_model_and_formatter()

    # Simple one-shot query
    from agentscope.message import Msg
    user_msg = Msg(name="user", content=task, role="user")
    sys_msg = Msg(name="system", content=sys_prompt, role="system")

    response = chat_model([sys_msg, user_msg])
    return response.content if hasattr(response, 'content') else str(response)
```

**Step 4: Run test — PASS**

**Step 5: Commit**

```bash
git add src/adclaw/agents/tools/delegation_executor.py tests/test_delegation_executor.py
git commit -m "feat: delegation executor — runs sub-agent with persona config"
```

---

## Task 7: Shared Memory Tools

**Files:**
- Create: `/root/AdClaw/src/adclaw/agents/tools/shared_memory.py`
- Create: `/root/AdClaw/tests/test_shared_memory.py`

**Step 1: Write the failing test**

```python
# tests/test_shared_memory.py
import os
import tempfile
import pytest
from adclaw.agents.tools.shared_memory import (
    make_read_shared_file,
    make_write_shared_file,
    make_list_shared_files,
)


class TestSharedMemory:
    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()
        self.shared_root = os.path.join(self.tmpdir, "shared")
        os.makedirs(os.path.join(self.shared_root, "researcher"), exist_ok=True)
        os.makedirs(os.path.join(self.shared_root, "content"), exist_ok=True)

    def test_write_shared_file(self):
        write_fn = make_write_shared_file(self.shared_root, "researcher")
        result = write_fn(filename="report.md", content="# Daily Report\nTrending: AI agents")
        assert "success" in result.lower()
        assert os.path.exists(os.path.join(self.shared_root, "researcher", "report.md"))

    def test_write_rejects_path_traversal(self):
        write_fn = make_write_shared_file(self.shared_root, "researcher")
        result = write_fn(filename="../../../etc/passwd", content="hack")
        assert "error" in result.lower()

    def test_read_shared_file(self):
        # Write a file first
        with open(os.path.join(self.shared_root, "researcher", "report.md"), "w") as f:
            f.write("# Report\nContent here")
        read_fn = make_read_shared_file(self.shared_root)
        result = read_fn(agent_id="researcher", filename="report.md")
        assert "Content here" in result

    def test_read_nonexistent(self):
        read_fn = make_read_shared_file(self.shared_root)
        result = read_fn(agent_id="researcher", filename="nope.md")
        assert "not found" in result.lower()

    def test_read_rejects_path_traversal(self):
        read_fn = make_read_shared_file(self.shared_root)
        result = read_fn(agent_id="researcher", filename="../../etc/passwd")
        assert "error" in result.lower()

    def test_list_shared_files(self):
        with open(os.path.join(self.shared_root, "researcher", "a.md"), "w") as f:
            f.write("a")
        with open(os.path.join(self.shared_root, "researcher", "b.md"), "w") as f:
            f.write("b")
        list_fn = make_list_shared_files(self.shared_root)
        result = list_fn(agent_id="researcher")
        assert "a.md" in result
        assert "b.md" in result

    def test_list_all_agents_shared(self):
        """List files across all agents' shared dirs."""
        list_fn = make_list_shared_files(self.shared_root)
        result = list_fn()  # no agent_id = list all
        assert "researcher" in result
        assert "content" in result

    def test_write_only_own_dir(self):
        """Agent can only write to its own shared dir."""
        write_fn = make_write_shared_file(self.shared_root, "researcher")
        # Trying to write to content's dir via filename manipulation
        result = write_fn(filename="../content/hack.md", content="hacked")
        assert "error" in result.lower()
```

**Step 2: Run test — FAIL**

**Step 3: Write implementation**

```python
# src/adclaw/agents/tools/shared_memory.py
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def _is_safe_path(base: str, requested: str) -> bool:
    """Check that resolved path stays within base directory."""
    base_resolved = os.path.realpath(base)
    full_resolved = os.path.realpath(os.path.join(base, requested))
    return full_resolved.startswith(base_resolved + os.sep) or full_resolved == base_resolved


def make_write_shared_file(shared_root: str, agent_id: str):
    """Create a write_shared_file tool scoped to agent's shared dir."""
    agent_dir = os.path.join(shared_root, agent_id)

    def write_shared_file(filename: str, content: str) -> str:
        """Write a file to your shared directory where other agents can read it.

        Use this to publish reports, data, drafts for other team members.

        Args:
            filename: File name (e.g., "daily-report.md"). No path separators.
            content: File content to write.

        Returns:
            Success or error message.
        """
        if not _is_safe_path(agent_dir, filename):
            return "Error: Invalid filename — path traversal not allowed."
        os.makedirs(agent_dir, exist_ok=True)
        filepath = os.path.join(agent_dir, os.path.basename(filename))
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            return f"Success: Written to shared/{agent_id}/{os.path.basename(filename)}"
        except Exception as e:
            return f"Error writing file: {e}"

    return write_shared_file


def make_read_shared_file(shared_root: str):
    """Create a read_shared_file tool that can read any agent's shared files."""

    def read_shared_file(agent_id: str, filename: str) -> str:
        """Read a file from any agent's shared directory.

        Use this to read reports, data, drafts published by other team members.

        Args:
            agent_id: The agent whose shared file to read (e.g., "researcher").
            filename: The file name to read.

        Returns:
            File content or error message.
        """
        agent_dir = os.path.join(shared_root, agent_id)
        if not _is_safe_path(agent_dir, filename):
            return "Error: Invalid path — path traversal not allowed."
        filepath = os.path.join(agent_dir, filename)
        if not os.path.exists(filepath):
            return f"Error: File not found: shared/{agent_id}/{filename}"
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"

    return read_shared_file


def make_list_shared_files(shared_root: str):
    """Create a list_shared_files tool."""

    def list_shared_files(agent_id: str = "") -> str:
        """List files in shared directories.

        Args:
            agent_id: Specific agent ID to list, or empty to list all agents' files.

        Returns:
            Formatted list of shared files.
        """
        if agent_id:
            agent_dir = os.path.join(shared_root, agent_id)
            if not os.path.isdir(agent_dir):
                return f"No shared directory for agent '{agent_id}'."
            files = [f for f in os.listdir(agent_dir) if os.path.isfile(os.path.join(agent_dir, f))]
            return f"shared/{agent_id}/: {', '.join(files) if files else '(empty)'}"
        else:
            lines = []
            if not os.path.isdir(shared_root):
                return "No shared directories exist yet."
            for d in sorted(os.listdir(shared_root)):
                dp = os.path.join(shared_root, d)
                if os.path.isdir(dp):
                    files = [f for f in os.listdir(dp) if os.path.isfile(os.path.join(dp, f))]
                    lines.append(f"shared/{d}/: {', '.join(files) if files else '(empty)'}")
            return "\n".join(lines) if lines else "No shared directories."

    return list_shared_files
```

**Step 4: Run test — PASS**

**Step 5: Commit**

```bash
git add src/adclaw/agents/tools/shared_memory.py tests/test_shared_memory.py
git commit -m "feat: shared memory tools — read/write/list across agent personas"
```

---

## Task 8: Persona REST API

**Files:**
- Create: `/root/AdClaw/src/adclaw/app/routers/personas.py`
- Modify: `/root/AdClaw/src/adclaw/app/routers/__init__.py`
- Create: `/root/AdClaw/tests/test_api_personas.py`

**Step 1: Write the failing test**

```python
# tests/test_api_personas.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from adclaw.config.config import Config, AgentsConfig, PersonaConfig


@pytest.fixture
def client():
    """Create test client with mocked config."""
    from adclaw.app.routers.personas import router
    from fastapi import FastAPI
    app = FastAPI()
    app.include_router(router, prefix="/api")
    return TestClient(app)


class TestPersonaAPI:
    def test_list_empty(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = Config()
            resp = client.get("/api/agents/personas")
            assert resp.status_code == 200
            assert resp.json() == []

    def test_create_persona(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock_load, \
             patch("adclaw.app.routers.personas.save_config") as mock_save:
            mock_load.return_value = Config()
            resp = client.post("/api/agents/personas", json={
                "id": "researcher",
                "name": "Researcher",
                "soul_md": "## Role\nFind facts.",
                "model_provider": "aliyun-intl",
                "model_name": "qwen3.5-plus",
            })
            assert resp.status_code == 201
            assert resp.json()["id"] == "researcher"
            mock_save.assert_called_once()

    def test_create_duplicate_id(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = Config(agents=AgentsConfig(
                personas=[PersonaConfig(id="researcher", name="R")]
            ))
            resp = client.post("/api/agents/personas", json={
                "id": "researcher", "name": "Another"
            })
            assert resp.status_code == 409

    def test_get_persona(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = Config(agents=AgentsConfig(
                personas=[PersonaConfig(id="r", name="R", soul_md="Be helpful.")]
            ))
            resp = client.get("/api/agents/personas/r")
            assert resp.status_code == 200
            assert resp.json()["soul_md"] == "Be helpful."

    def test_get_persona_not_found(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = Config()
            resp = client.get("/api/agents/personas/nope")
            assert resp.status_code == 404

    def test_update_persona(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock_load, \
             patch("adclaw.app.routers.personas.save_config") as mock_save:
            mock_load.return_value = Config(agents=AgentsConfig(
                personas=[PersonaConfig(id="r", name="R")]
            ))
            resp = client.put("/api/agents/personas/r", json={
                "soul_md": "Updated soul."
            })
            assert resp.status_code == 200
            assert resp.json()["soul_md"] == "Updated soul."

    def test_delete_persona(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock_load, \
             patch("adclaw.app.routers.personas.save_config") as mock_save:
            mock_load.return_value = Config(agents=AgentsConfig(
                personas=[PersonaConfig(id="r", name="R")]
            ))
            resp = client.delete("/api/agents/personas/r")
            assert resp.status_code == 200

    def test_only_one_coordinator(self, client):
        with patch("adclaw.app.routers.personas.load_config") as mock_load, \
             patch("adclaw.app.routers.personas.save_config") as mock_save:
            mock_load.return_value = Config(agents=AgentsConfig(
                personas=[PersonaConfig(id="a", name="A", is_coordinator=True)]
            ))
            resp = client.post("/api/agents/personas", json={
                "id": "b", "name": "B", "is_coordinator": True,
            })
            assert resp.status_code == 409
```

**Step 2: Run test — FAIL**

**Step 3: Write implementation**

```python
# src/adclaw/app/routers/personas.py
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ...config.config import PersonaConfig, PersonaCronConfig, load_config, save_config

logger = logging.getLogger(__name__)
router = APIRouter(tags=["personas"])


class PersonaCreateRequest(BaseModel):
    id: str
    name: str
    soul_md: str = ""
    model_provider: str = ""
    model_name: str = ""
    skills: list[str] = []
    mcp_clients: list[str] = []
    is_coordinator: bool = False
    cron: Optional[PersonaCronConfig] = None


class PersonaUpdateRequest(BaseModel):
    name: Optional[str] = None
    soul_md: Optional[str] = None
    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    skills: Optional[list[str]] = None
    mcp_clients: Optional[list[str]] = None
    is_coordinator: Optional[bool] = None
    cron: Optional[PersonaCronConfig] = None


@router.get("/agents/personas")
def list_personas():
    config = load_config()
    return [p.model_dump() for p in config.agents.personas]


@router.post("/agents/personas", status_code=201)
def create_persona(req: PersonaCreateRequest):
    config = load_config()
    existing_ids = {p.id for p in config.agents.personas}
    if req.id in existing_ids:
        raise HTTPException(409, f"Persona '{req.id}' already exists")
    if req.is_coordinator and any(p.is_coordinator for p in config.agents.personas):
        raise HTTPException(409, "A coordinator already exists")
    persona = PersonaConfig(**req.model_dump())
    config.agents.personas.append(persona)
    save_config(config)
    return persona.model_dump()


@router.get("/agents/personas/{persona_id}")
def get_persona(persona_id: str):
    config = load_config()
    for p in config.agents.personas:
        if p.id == persona_id:
            return p.model_dump()
    raise HTTPException(404, f"Persona '{persona_id}' not found")


@router.put("/agents/personas/{persona_id}")
def update_persona(persona_id: str, req: PersonaUpdateRequest):
    config = load_config()
    for i, p in enumerate(config.agents.personas):
        if p.id == persona_id:
            data = p.model_dump()
            updates = req.model_dump(exclude_none=True)
            if "is_coordinator" in updates and updates["is_coordinator"]:
                others = [pp for pp in config.agents.personas if pp.is_coordinator and pp.id != persona_id]
                if others:
                    raise HTTPException(409, "Another coordinator already exists")
            data.update(updates)
            config.agents.personas[i] = PersonaConfig(**data)
            save_config(config)
            return config.agents.personas[i].model_dump()
    raise HTTPException(404, f"Persona '{persona_id}' not found")


@router.delete("/agents/personas/{persona_id}")
def delete_persona(persona_id: str):
    config = load_config()
    for i, p in enumerate(config.agents.personas):
        if p.id == persona_id:
            config.agents.personas.pop(i)
            save_config(config)
            return {"status": "deleted", "id": persona_id}
    raise HTTPException(404, f"Persona '{persona_id}' not found")
```

**Step 4: Register router in `__init__.py`**

Add import and mount in `/root/AdClaw/src/adclaw/app/routers/__init__.py`.

**Step 5: Run test — PASS**

**Step 6: Commit**

```bash
git add src/adclaw/app/routers/personas.py src/adclaw/app/routers/__init__.py tests/test_api_personas.py
git commit -m "feat: REST API for persona CRUD"
```

---

## Task 9: Persona Cron Integration

**Files:**
- Modify: `/root/AdClaw/src/adclaw/app/crons/manager.py`
- Create: `/root/AdClaw/tests/test_persona_cron.py`

**Step 1: Write the failing test**

```python
# tests/test_persona_cron.py
import pytest
from adclaw.config.config import PersonaConfig, PersonaCronConfig
from adclaw.agents.persona_manager import PersonaManager


class TestPersonaCron:
    def test_persona_cron_job_spec(self):
        """PersonaConfig with cron generates valid job spec."""
        persona = PersonaConfig(
            id="researcher",
            name="Researcher",
            soul_md="Find facts.",
            cron=PersonaCronConfig(
                enabled=True,
                schedule="0 8,14,20 * * *",
                prompt="Scan for trends",
                output="both",
            ),
        )
        assert persona.cron.enabled
        assert persona.cron.schedule == "0 8,14,20 * * *"

    def test_personas_with_cron(self):
        """PersonaManager returns only personas with enabled cron."""
        personas = [
            PersonaConfig(id="a", name="A", cron=PersonaCronConfig(enabled=True, schedule="0 8 * * *", prompt="do a")),
            PersonaConfig(id="b", name="B"),
            PersonaConfig(id="c", name="C", cron=PersonaCronConfig(enabled=False, schedule="0 9 * * *", prompt="do c")),
        ]
        mgr = PersonaManager(working_dir="/tmp", personas=personas)
        cron_personas = [p for p in mgr.all_personas if p.cron and p.cron.enabled]
        assert len(cron_personas) == 1
        assert cron_personas[0].id == "a"
```

**Step 2: Run test — should PASS using existing models**

**Step 3: Add persona cron sync to CronManager**

In `manager.py`, add method `sync_persona_crons(personas)`:

```python
async def sync_persona_crons(self, personas: list[PersonaConfig]) -> None:
    """Sync cron jobs for all personas with enabled cron."""
    for persona in personas:
        job_id = f"persona_{persona.id}"
        if persona.cron and persona.cron.enabled:
            # Create or update job
            spec = CronJobSpec(
                id=job_id,
                name=f"Persona: {persona.name}",
                enabled=True,
                schedule=ScheduleSpec.from_cron_expr(persona.cron.schedule),
                task_type="agent",
                request=CronJobRequest(prompt=persona.cron.prompt),
                dispatch=DispatchSpec(channel="telegram", mode="final"),
                runtime=JobRuntimeSpec(),
                meta={"persona_id": persona.id, "output_mode": persona.cron.output},
            )
            await self.upsert_job(spec)
        else:
            # Remove job if exists
            await self.remove_job_if_exists(job_id)
```

Call `sync_persona_crons` on startup and after persona CRUD operations.

**Step 4: Run test — PASS**

**Step 5: Commit**

```bash
git add src/adclaw/app/crons/manager.py tests/test_persona_cron.py
git commit -m "feat: sync persona cron jobs to CronManager"
```

---

## Task 10: Preset Templates

**Files:**
- Create: `/root/AdClaw/src/adclaw/agents/persona_templates.py`
- Create: `/root/AdClaw/tests/test_persona_templates.py`

**Step 1: Write the failing test**

```python
# tests/test_persona_templates.py
import pytest
from adclaw.agents.persona_templates import TEMPLATES, get_template


class TestPersonaTemplates:
    def test_five_templates_exist(self):
        assert len(TEMPLATES) == 5

    def test_template_ids(self):
        ids = {t["id"] for t in TEMPLATES}
        assert ids == {"researcher", "content-writer", "seo-specialist", "ads-manager", "social-media"}

    def test_get_template_by_id(self):
        t = get_template("researcher")
        assert t is not None
        assert t["name"] == "Researcher"
        assert len(t["soul_md"]) > 50

    def test_get_unknown_template(self):
        assert get_template("nope") is None

    def test_templates_have_required_fields(self):
        for t in TEMPLATES:
            assert "id" in t
            assert "name" in t
            assert "soul_md" in t
            assert "skills" in t
            assert "mcp_clients" in t
```

**Step 2: Run test — FAIL**

**Step 3: Write implementation**

```python
# src/adclaw/agents/persona_templates.py

TEMPLATES = [
    {
        "id": "researcher",
        "name": "Researcher",
        "soul_md": """## Role
You are a research specialist. Your job is to find, verify, and summarize information.

## Style
- Facts only, no speculation
- Always cite sources
- Write structured reports with clear sections
- Prioritize recency and relevance

## Boundaries
- Never fabricate data or sources
- Flag uncertainty explicitly
- Write reports to shared memory for other agents""",
        "model_provider": "",
        "model_name": "",
        "skills": [],
        "mcp_clients": ["brave_search", "xai_search", "exa"],
    },
    {
        "id": "content-writer",
        "name": "Content Writer",
        "soul_md": """## Role
You are a content specialist. You create engaging, original content adapted to the brand voice.

## Style
- Match the user's tone and brand guidelines
- Write for the target audience, not for search engines
- Create compelling hooks and clear structure
- Vary sentence length for rhythm

## Boundaries
- Never plagiarize
- Flag when you need brand guidelines or examples
- Read researcher's reports from shared memory for context""",
        "model_provider": "",
        "model_name": "",
        "skills": [],
        "mcp_clients": ["citedy"],
    },
    {
        "id": "seo-specialist",
        "name": "SEO Specialist",
        "soul_md": """## Role
You are a technical SEO expert. You analyze, audit, and optimize for search engines.

## Style
- Data-driven recommendations with metrics
- Prioritize by impact (high/medium/low)
- Include actionable steps, not just observations
- Track competitors and SERP changes

## Boundaries
- No black-hat techniques
- Always explain WHY a recommendation matters
- Cite tools and data sources""",
        "model_provider": "",
        "model_name": "",
        "skills": [],
        "mcp_clients": ["citedy"],
    },
    {
        "id": "ads-manager",
        "name": "Ads Manager",
        "soul_md": """## Role
You are a performance marketing specialist. You manage ad campaigns across platforms.

## Style
- ROI-focused: every recommendation tied to metrics
- A/B testing mindset
- Budget-aware: optimize spend, not just reach
- Platform-specific best practices

## Boundaries
- Never exceed stated budgets
- Flag risks (policy violations, audience overlap)
- Report results with clear attribution""",
        "model_provider": "",
        "model_name": "",
        "skills": [],
        "mcp_clients": [],
    },
    {
        "id": "social-media",
        "name": "Social Media",
        "soul_md": """## Role
You are a social media strategist. You create platform-native content and track trends.

## Style
- Trend-aware: catch trends early
- Platform-native: different voice for X, LinkedIn, Instagram
- Engagement-focused: hooks, CTAs, visual suggestions
- Concise: respect character limits

## Boundaries
- Never post without approval (draft only)
- Flag controversial or sensitive topics
- Read researcher's intel for trending topics""",
        "model_provider": "",
        "model_name": "",
        "skills": [],
        "mcp_clients": ["xai_search"],
    },
]


def get_template(template_id: str) -> dict | None:
    for t in TEMPLATES:
        if t["id"] == template_id:
            return t.copy()
    return None
```

**Step 4: Run test — PASS**

**Step 5: Add template endpoint to API**

In `personas.py`, add:

```python
@router.get("/agents/templates")
def list_templates():
    from ...agents.persona_templates import TEMPLATES
    return TEMPLATES

@router.post("/agents/personas/from-template/{template_id}", status_code=201)
def create_from_template(template_id: str):
    from ...agents.persona_templates import get_template
    tmpl = get_template(template_id)
    if not tmpl:
        raise HTTPException(404, f"Template '{template_id}' not found")
    # Create persona from template
    req = PersonaCreateRequest(**tmpl)
    return create_persona(req)
```

**Step 6: Commit**

```bash
git add src/adclaw/agents/persona_templates.py src/adclaw/app/routers/personas.py tests/test_persona_templates.py
git commit -m "feat: 5 preset persona templates with API endpoint"
```

---

## Task 11: Web UI — Agents Page

**Files:**
- Create: `/root/AdClaw/console/src/pages/Agents/index.tsx`
- Create: `/root/AdClaw/console/src/pages/Agents/index.module.less`
- Create: `/root/AdClaw/console/src/pages/Agents/usePersonas.ts`
- Create: `/root/AdClaw/console/src/pages/Agents/components/PersonaCard.tsx`
- Create: `/root/AdClaw/console/src/pages/Agents/components/PersonaDrawer.tsx`
- Create: `/root/AdClaw/console/src/pages/Agents/components/index.ts`
- Create: `/root/AdClaw/console/src/api/modules/persona.ts`
- Create: `/root/AdClaw/console/src/api/types/persona.ts`
- Modify: `/root/AdClaw/console/src/api/index.ts`
- Modify: `/root/AdClaw/console/src/api/types/index.ts`
- Modify: `/root/AdClaw/console/src/layouts/MainLayout/index.tsx`
- Modify: `/root/AdClaw/console/src/layouts/Sidebar.tsx`
- Modify: `/root/AdClaw/console/src/layouts/Header.tsx`
- Modify: `/root/AdClaw/console/src/locales/en.json`
- Modify: `/root/AdClaw/console/src/locales/zh.json`

**Step 1: Create API types**

```typescript
// console/src/api/types/persona.ts
export interface PersonaCron {
  enabled: boolean;
  schedule: string;
  prompt: string;
  output: "chat" | "file" | "both";
}

export interface Persona {
  id: string;
  name: string;
  soul_md: string;
  model_provider: string;
  model_name: string;
  skills: string[];
  mcp_clients: string[];
  is_coordinator: boolean;
  cron: PersonaCron | null;
}

export interface PersonaTemplate {
  id: string;
  name: string;
  soul_md: string;
  skills: string[];
  mcp_clients: string[];
}
```

**Step 2: Create API module**

```typescript
// console/src/api/modules/persona.ts
import { request } from "../request";
import { Persona, PersonaTemplate } from "../types/persona";

export const persona = {
  list: () => request<Persona[]>("/agents/personas"),
  get: (id: string) => request<Persona>(`/agents/personas/${id}`),
  create: (data: Partial<Persona>) => request<Persona>("/agents/personas", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Persona>) => request<Persona>(`/agents/personas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/agents/personas/${id}`, { method: "DELETE" }),
  templates: () => request<PersonaTemplate[]>("/agents/templates"),
  createFromTemplate: (templateId: string) => request<Persona>(`/agents/personas/from-template/${templateId}`, { method: "POST" }),
};
```

**Step 3: Create page components**

Follow existing pattern from Skills page:
- `PersonaCard`: Ant Design Card with name, SOUL preview (first 2 lines), LLM badge, skills/MCP count, coordinator badge, cron status
- `PersonaDrawer`: Drawer with form — name, id (auto-slug), SOUL.md textarea, provider/model dropdowns, skills multi-select, MCP multi-select, coordinator toggle, cron section
- `usePersonas`: hook with list/create/update/delete + loading state
- Main page: grid of cards + "Create" button + "From Template" dropdown

**Step 4: Wire routing**

In `MainLayout/index.tsx` add Route, in `Sidebar.tsx` add menu item under appropriate section, in `Header.tsx` add label.

**Step 5: Build and verify**

```bash
cd /root/AdClaw/console && npm run build
```

**Step 6: Commit**

```bash
git add console/
git commit -m "feat: Web UI — Agents page with persona cards, drawer, templates"
```

---

## Task 12: Integration Tests — Full Orchestration

**Files:**
- Create: `/root/AdClaw/tests/test_integration_personas.py`

**Step 1: Write comprehensive integration tests**

```python
# tests/test_integration_personas.py
import os
import pytest
import tempfile
from adclaw.config.config import Config, AgentsConfig, PersonaConfig, PersonaCronConfig
from adclaw.agents.persona_manager import PersonaManager
from adclaw.agents.persona_templates import TEMPLATES, get_template
from adclaw.agents.tools.shared_memory import (
    make_read_shared_file, make_write_shared_file, make_list_shared_files,
)
from adclaw.agents.tools.delegation import make_delegate_tool, DelegationContext


class TestFullOrchestration:
    """Integration tests for multi-agent persona system."""

    def setup_method(self):
        self.tmpdir = tempfile.mkdtemp()
        self.personas = [
            PersonaConfig(
                id="coordinator",
                name="Coordinator",
                soul_md="## Coordinator\nYou orchestrate the team.",
                is_coordinator=True,
            ),
            PersonaConfig(
                id="researcher",
                name="Researcher",
                soul_md="## Researcher\nYou find facts.",
                model_provider="aliyun-intl",
                model_name="qwen3.5-plus",
                mcp_clients=["brave_search"],
                cron=PersonaCronConfig(
                    enabled=True,
                    schedule="0 8,14,20 * * *",
                    prompt="Scan for AI trends",
                    output="both",
                ),
            ),
            PersonaConfig(
                id="content",
                name="Content Writer",
                soul_md="## Content\nYou write posts.",
                skills=["content_writing"],
                mcp_clients=["citedy"],
            ),
        ]
        self.mgr = PersonaManager(working_dir=self.tmpdir, personas=self.personas)
        self.mgr.ensure_dirs()

    # --- Routing ---

    def test_tag_routing_researcher(self):
        assert self.mgr.resolve_tag("@researcher find AI trends") == "researcher"

    def test_tag_routing_content(self):
        assert self.mgr.resolve_tag("@content write a blog post") == "content"

    def test_no_tag_returns_none(self):
        assert self.mgr.resolve_tag("just a regular message") is None

    def test_coordinator_fallback(self):
        coord = self.mgr.get_coordinator()
        assert coord.id == "coordinator"

    def test_strip_tag(self):
        assert self.mgr.strip_tag("@researcher find trends") == "find trends"

    def test_strip_no_tag(self):
        assert self.mgr.strip_tag("no tag here") == "no tag here"

    # --- Working dirs ---

    def test_agent_working_dirs_created(self):
        for pid in ["coordinator", "researcher", "content"]:
            assert os.path.isdir(os.path.join(self.tmpdir, "agents", pid))
            assert os.path.isdir(os.path.join(self.tmpdir, "agents", pid, "memory"))

    def test_shared_dirs_created(self):
        for pid in ["coordinator", "researcher", "content"]:
            assert os.path.isdir(os.path.join(self.tmpdir, "shared", pid))

    # --- Shared memory ---

    def test_shared_memory_write_read_cycle(self):
        shared_root = os.path.join(self.tmpdir, "shared")
        write = make_write_shared_file(shared_root, "researcher")
        read = make_read_shared_file(shared_root)
        list_fn = make_list_shared_files(shared_root)

        # Researcher writes
        result = write(filename="trends.md", content="# AI Trends\n1. Agents\n2. MCP")
        assert "success" in result.lower()

        # Content reads researcher's file
        content = read(agent_id="researcher", filename="trends.md")
        assert "AI Trends" in content
        assert "Agents" in content

        # List shows the file
        listing = list_fn(agent_id="researcher")
        assert "trends.md" in listing

    def test_shared_memory_cross_agent_read(self):
        """Content agent can read researcher's shared files."""
        shared_root = os.path.join(self.tmpdir, "shared")
        write_r = make_write_shared_file(shared_root, "researcher")
        read_c = make_read_shared_file(shared_root)  # content reads

        write_r(filename="intel.md", content="Breaking: new model released")
        result = read_c(agent_id="researcher", filename="intel.md")
        assert "Breaking" in result

    def test_shared_memory_path_traversal_blocked(self):
        shared_root = os.path.join(self.tmpdir, "shared")
        write = make_write_shared_file(shared_root, "researcher")
        result = write(filename="../../../etc/passwd", content="hack")
        assert "error" in result.lower()

    # --- Team summary ---

    def test_team_summary_includes_all(self):
        summary = self.mgr.get_team_summary()
        assert "@coordinator" in summary
        assert "@researcher" in summary
        assert "@content" in summary
        assert "coordinator" in summary.lower()

    # --- Config ---

    def test_persona_model_override(self):
        p = self.mgr.get_persona("researcher")
        assert p.model_provider == "aliyun-intl"
        assert p.model_name == "qwen3.5-plus"

    def test_persona_skill_filter(self):
        p = self.mgr.get_persona("content")
        assert p.skills == ["content_writing"]

    def test_persona_mcp_filter(self):
        p = self.mgr.get_persona("researcher")
        assert p.mcp_clients == ["brave_search"]

    # --- Cron ---

    def test_cron_personas(self):
        cron_personas = [p for p in self.mgr.all_personas if p.cron and p.cron.enabled]
        assert len(cron_personas) == 1
        assert cron_personas[0].id == "researcher"
        assert cron_personas[0].cron.output == "both"

    # --- Delegation ---

    def test_delegation_tool_created(self):
        tool = make_delegate_tool(self.mgr)
        assert callable(tool)

    def test_delegation_unknown_agent(self):
        tool = make_delegate_tool(self.mgr)
        result = tool(agent_id="nonexistent", task="do something")
        assert "not found" in result.lower()

    def test_delegation_depth_limit(self):
        ctx = DelegationContext(max_depth=2)
        assert ctx.can_delegate()
        ctx.depth = 2
        assert not ctx.can_delegate()

    # --- Templates ---

    def test_create_from_template(self):
        tmpl = get_template("researcher")
        assert tmpl is not None
        persona = PersonaConfig(**tmpl)
        assert persona.id == "researcher"
        assert len(persona.soul_md) > 50

    def test_all_templates_valid(self):
        for t in TEMPLATES:
            p = PersonaConfig(**t)
            assert p.id
            assert p.name

    # --- Migration / backward compat ---

    def test_empty_personas_no_crash(self):
        """System works with empty personas list."""
        mgr = PersonaManager(working_dir=self.tmpdir, personas=[])
        assert mgr.get_coordinator() is None
        assert mgr.resolve_tag("@test hi") is None
        assert mgr.all_personas == []
        assert mgr.get_team_summary() == "## Your Team\n"

    def test_config_without_personas_field(self):
        """Config without personas field defaults to empty list."""
        config = Config()
        assert config.agents.personas == []
```

**Step 2: Run all tests**

```bash
cd /root/AdClaw && python -m pytest tests/ -v --tb=short
```

Expected: ALL PASS

**Step 3: Commit**

```bash
git add tests/test_integration_personas.py
git commit -m "test: comprehensive integration tests for persona orchestration"
```

---

## Task 13: Deploy & Live Smoke Test

**Step 1: Build Docker image**

```bash
cd /root/AdClaw
docker build -t nttylock/adclaw:personas .
```

**Step 2: Redeploy container**

```bash
docker rm -f adclaw
docker run -d --name adclaw --restart unless-stopped \
  -p 8088:8088 \
  -v copaw-data:/app/working \
  -v copaw-secret:/app/working.secret \
  -e ADCLAW_ENABLED_CHANNELS=discord,dingtalk,feishu,qq,console,telegram \
  -e LOG_LEVEL=DEBUG \
  nttylock/adclaw:personas
```

**Step 3: Create test personas via API**

```bash
# Create from templates
curl -X POST http://localhost:8088/api/agents/personas/from-template/researcher
curl -X POST http://localhost:8088/api/agents/personas/from-template/content-writer

# Create coordinator manually
curl -X POST http://localhost:8088/api/agents/personas -H "Content-Type: application/json" -d '{
  "id": "coordinator",
  "name": "Coordinator",
  "soul_md": "You are the team coordinator. Delegate tasks to specialists using delegate_to_agent tool.",
  "is_coordinator": true
}'

# Verify
curl http://localhost:8088/api/agents/personas | python3 -m json.tool
```

**Step 4: Test via Telegram (30-50 messages)**

Send these messages to @tonepen_bot and verify routing + responses:

**Routing tests (10):**
1. `@researcher find latest AI agent trends`
2. `@content-writer write a tweet about AI agents`
3. `what's the weather like?` (should go to coordinator)
4. `@researcher what happened on HN today?`
5. `@content-writer create a LinkedIn post about MCP`
6. `@unknown hello` (should go to coordinator, tag ignored)
7. `@researcher @content-writer both of you` (first tag wins)
8. `hello` (coordinator)
9. `@researcher summarize https://example.com`
10. `@content-writer rewrite this: "AI is cool"`

**Delegation tests (10):**
11. `research AI agent trends and write a summary post` (coordinator should delegate)
12. `ask the researcher about new LLM releases`
13. `have the content writer draft a newsletter`
14. `create a report on SEO trends and then a blog post`
15-20. Various delegation scenarios

**Shared memory tests (10):**
21. `@researcher write your findings to shared memory`
22. `@content-writer read the researcher's latest report`
23. `@researcher list all shared files`
24-30. File sharing workflows

**Memory tests (10):**
31. `@researcher remember that our main competitor is X`
32. `@researcher what do you remember about competitors?`
33. `@content-writer what's in your memory?`
34-40. Memory isolation and cross-agent recall

**Cron tests (5):**
41. Check cron job created: `curl http://localhost:8088/cron/jobs`
42. Trigger manual run: `curl -X POST http://localhost:8088/cron/jobs/persona_researcher/run`
43-45. Verify output in chat and shared files

**Edge cases (5):**
46. Empty message
47. Very long message (>4000 chars)
48. Rapid fire 5 messages
49. Switch between agents mid-conversation
50. Delete a persona while it has active cron

**Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: multi-agent personas MVP — complete implementation"
git push origin main
```
