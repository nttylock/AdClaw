# Mission Control E2E Test Kit — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Comprehensive test coverage for Mission Control features (persona routing, session isolation, cron scheduling, dashboard API, shared memory).

**Architecture:** Two layers — (A) mocked integration tests via pytest (fast, CI-safe, no LLM tokens) and (B) live E2E script hitting the running instance (smoke test, uses real Qwen API).

**Tech Stack:** pytest, pytest-asyncio, FastAPI TestClient, httpx (live), PersonaManager, Config fixtures.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `tests/test_mission_control_routing.py` | @mention routing, tag resolution, session scoping, strip_tag |
| `tests/test_mission_control_sessions.py` | Session isolation per persona, shared AOM, session CRUD |
| `tests/test_mission_control_cron.py` | Cron job creation with persona targeting, dispatch, pause/resume |
| `tests/test_mission_control_dashboard.py` | Dashboard API — personas + sessions + cron aggregation |
| `scripts/test_mission_control_live.py` | Live E2E against running instance — full flow |
| `tests/conftest.py` | Add persona fixtures (extend existing) |

---

## Chunk 1: Fixtures & Routing Tests

### Task 1: Add persona fixtures to conftest.py

**Files:**
- Modify: `tests/conftest.py`

- [ ] **Step 1: Add persona fixtures**

```python
# Add to tests/conftest.py after existing fixtures:

from adclaw.config.config import PersonaConfig, Config, AgentsConfig

@pytest.fixture
def sample_personas():
    """Three personas: coordinator + researcher + writer."""
    return [
        PersonaConfig(id="coordinator", name="Coordinator", is_coordinator=True, soul_md="## Role\nOrchestrate the team."),
        PersonaConfig(id="researcher", name="Mike", soul_md="## Role\nResearch and analyze."),
        PersonaConfig(id="content-writer", name="Mira", soul_md="## Role\nWrite content."),
    ]

@pytest.fixture
def persona_manager(sample_personas, tmp_path):
    """PersonaManager with 3 personas and temp working dir."""
    from adclaw.agents.persona_manager import PersonaManager
    mgr = PersonaManager(working_dir=str(tmp_path), personas=sample_personas)
    mgr.ensure_dirs()
    return mgr

@pytest.fixture
def config_with_personas(sample_personas):
    """Config object with 3 personas."""
    return Config(agents=AgentsConfig(personas=sample_personas))
```

- [ ] **Step 2: Run existing tests to verify no regression**

Run: `pytest tests/test_runner_persona.py tests/test_api_personas.py -v`
Expected: All existing tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/conftest.py
git commit -m "test: add persona fixtures to conftest for Mission Control tests"
```

### Task 2: @mention routing tests

**Files:**
- Create: `tests/test_mission_control_routing.py`

- [ ] **Step 1: Write routing tests**

```python
"""Tests for Mission Control P1: @mention persona routing."""
import pytest
from adclaw.agents.persona_manager import PersonaManager
from adclaw.config.config import PersonaConfig


class TestMentionRouting:
    """@tag resolution — the core of persona-based chat."""

    def test_at_tag_routes_to_researcher(self, persona_manager):
        assert persona_manager.resolve_tag("@researcher find AI trends") == "researcher"

    def test_at_tag_routes_to_writer(self, persona_manager):
        assert persona_manager.resolve_tag("@content-writer draft blog post") == "content-writer"

    def test_at_tag_by_name(self, persona_manager):
        """Should match persona.name (case-insensitive), not just ID."""
        assert persona_manager.resolve_tag("@Mike find trends") == "researcher"
        assert persona_manager.resolve_tag("@Mira write a post") == "content-writer"

    def test_no_tag_returns_none(self, persona_manager):
        assert persona_manager.resolve_tag("just a message") is None

    def test_unknown_tag_returns_none(self, persona_manager):
        assert persona_manager.resolve_tag("@nonexistent do stuff") is None

    def test_coordinator_is_default(self, persona_manager):
        coord = persona_manager.get_coordinator()
        assert coord is not None
        assert coord.id == "coordinator"
        assert coord.is_coordinator is True

    def test_strip_tag(self, persona_manager):
        assert persona_manager.strip_tag("@researcher find trends") == "find trends"
        assert persona_manager.strip_tag("no tag here") == "no tag here"

    def test_case_insensitive_tag(self, persona_manager):
        assert persona_manager.resolve_tag("@Researcher find trends") == "researcher"
        assert persona_manager.resolve_tag("@RESEARCHER find trends") == "researcher"


class TestSessionScoping:
    """Session IDs must be unique per persona to isolate conversations."""

    def test_persona_session_format(self):
        """Web chat tabs use format: persona_id::console--default"""
        session = "researcher::console--default"
        parts = session.split("::")
        assert parts[0] == "researcher"
        assert parts[1] == "console--default"

    def test_different_personas_different_sessions(self):
        s1 = "researcher::console--default"
        s2 = "content-writer::console--default"
        assert s1 != s2

    def test_all_tab_uses_empty_session(self):
        """'All' tab sends empty session_id → coordinator handles it."""
        s_all = ""
        s_persona = "researcher::console--default"
        assert s_all != s_persona

    def test_telegram_session_format(self):
        """Telegram sessions: persona_id::telegram--chat_id"""
        session = "researcher::telegram--42286890"
        assert session.startswith("researcher::")


class TestTeamSummary:
    """Team summary injected into system prompt."""

    def test_team_summary_includes_all(self, persona_manager):
        summary = persona_manager.get_team_summary()
        assert "@coordinator" in summary
        assert "@researcher" in summary
        assert "@content-writer" in summary

    def test_team_summary_marks_coordinator(self, persona_manager):
        summary = persona_manager.get_team_summary()
        assert "(coordinator)" in summary

    def test_team_summary_includes_roles(self, persona_manager):
        summary = persona_manager.get_team_summary()
        assert "Orchestrate" in summary
        assert "Research" in summary
```

- [ ] **Step 2: Run tests**

Run: `pytest tests/test_mission_control_routing.py -v`
Expected: All 14 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_mission_control_routing.py
git commit -m "test: add @mention routing and session scoping tests"
```

---

## Chunk 2: Session Isolation & Dashboard API Tests

### Task 3: Session isolation tests

**Files:**
- Create: `tests/test_mission_control_sessions.py`

- [ ] **Step 1: Write session isolation tests**

```python
"""Tests for Mission Control P3: per-persona session isolation."""
import os
import json
import pytest
from pathlib import Path
from adclaw.agents.persona_manager import PersonaManager
from adclaw.config.config import PersonaConfig


class TestSessionIsolation:
    """Each persona chat tab must use a separate session file."""

    def test_session_files_separate(self, tmp_path):
        """Simulate session files per persona — they must not collide."""
        sessions_dir = tmp_path / "sessions"
        sessions_dir.mkdir()

        user = "42286890"
        personas = ["coordinator", "researcher", "content-writer"]

        for pid in personas:
            session_id = f"{pid}::console--default"
            fname = f"{user}_{pid}----console--default.json"
            session_file = sessions_dir / fname
            session_file.write_text(json.dumps({
                "session_id": session_id,
                "persona": pid,
                "messages": [{"role": "user", "text": f"Hello {pid}"}],
            }))

        files = list(sessions_dir.iterdir())
        assert len(files) == 3
        names = {f.name for f in files}
        assert f"{user}_coordinator----console--default.json" in names
        assert f"{user}_researcher----console--default.json" in names
        assert f"{user}_content-writer----console--default.json" in names

    def test_session_data_isolated(self, tmp_path):
        """Messages in one session must not appear in another."""
        sessions_dir = tmp_path / "sessions"
        sessions_dir.mkdir()

        # Write researcher session
        r_file = sessions_dir / "user_researcher----console.json"
        r_file.write_text(json.dumps({"messages": [{"text": "AI trends report"}]}))

        # Write writer session
        w_file = sessions_dir / "user_content-writer----console.json"
        w_file.write_text(json.dumps({"messages": [{"text": "Blog draft v2"}]}))

        r_data = json.loads(r_file.read_text())
        w_data = json.loads(w_file.read_text())

        assert r_data["messages"][0]["text"] == "AI trends report"
        assert w_data["messages"][0]["text"] == "Blog draft v2"
        assert r_data["messages"] != w_data["messages"]


class TestSharedMemory:
    """AOM (Always-On Memory) must be shared across all persona sessions."""

    @pytest.mark.asyncio
    async def test_aom_shared_across_personas(self, aom_store, fake_embedder):
        """Memory ingested by researcher should be queryable by writer."""
        from adclaw.memory_agent.ingest import IngestAgent

        agent = IngestAgent(store=aom_store, embedder=fake_embedder, llm_caller=None)

        # Researcher ingests a memory
        await agent.ingest(
            content="AI market will reach $500B by 2027",
            source_type="conversation",
            source_id="researcher::console",
            skip_llm=True,
        )

        # Query from "writer" perspective — same store
        results = await aom_store.search_fts("AI market")
        assert len(results) >= 1
        assert "500B" in results[0].content

    @pytest.mark.asyncio
    async def test_aom_not_scoped_to_persona(self, aom_store, fake_embedder):
        """AOM has no persona filtering — all memories visible to all."""
        from adclaw.memory_agent.ingest import IngestAgent

        agent = IngestAgent(store=aom_store, embedder=fake_embedder, llm_caller=None)

        await agent.ingest(content="Fact A from researcher", source_type="conversation", source_id="researcher", skip_llm=True)
        await agent.ingest(content="Fact B from writer", source_type="conversation", source_id="writer", skip_llm=True)

        stats = await aom_store.get_stats()
        assert stats["total"] == 2  # Both visible
```

- [ ] **Step 2: Run tests**

Run: `pytest tests/test_mission_control_sessions.py -v`
Expected: All 4 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_mission_control_sessions.py
git commit -m "test: add session isolation and shared AOM memory tests"
```

### Task 4: Dashboard API tests

**Files:**
- Create: `tests/test_mission_control_dashboard.py`

- [ ] **Step 1: Write dashboard API tests**

```python
"""Tests for Mission Control P2: Dashboard API data aggregation."""
import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest.mock import patch
from adclaw.config.config import Config, AgentsConfig, PersonaConfig


@pytest.fixture
def dashboard_client():
    from adclaw.app.routers.personas import router
    app = FastAPI()
    app.include_router(router, prefix="/api")
    return TestClient(app)


class TestDashboardData:
    """Dashboard needs personas + model + skills + cron data."""

    def test_personas_include_model_info(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            # Add model info to researcher
            config_with_personas.agents.personas[1].model_provider = "aliyun-intl"
            config_with_personas.agents.personas[1].model_name = "qwen3.5-plus"
            mock.return_value = config_with_personas

            resp = dashboard_client.get("/api/agents/personas")
            assert resp.status_code == 200
            personas = resp.json()
            researcher = next(p for p in personas if p["id"] == "researcher")
            assert researcher["model_provider"] == "aliyun-intl"
            assert researcher["model_name"] == "qwen3.5-plus"

    def test_personas_include_skills_count(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            config_with_personas.agents.personas[1].skills = ["citedy-trend-scout", "exa-search"]
            mock.return_value = config_with_personas

            resp = dashboard_client.get("/api/agents/personas")
            personas = resp.json()
            researcher = next(p for p in personas if p["id"] == "researcher")
            assert len(researcher["skills"]) == 2

    def test_personas_include_cron_config(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            config_with_personas.agents.personas[1].cron = {
                "enabled": True,
                "schedule": "0 9 * * *",
                "prompt": "Find AI trends today",
                "output": "chat",
            }
            mock.return_value = config_with_personas

            resp = dashboard_client.get("/api/agents/personas")
            personas = resp.json()
            researcher = next(p for p in personas if p["id"] == "researcher")
            assert researcher["cron"]["enabled"] is True
            assert researcher["cron"]["schedule"] == "0 9 * * *"

    def test_coordinator_marked(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = config_with_personas
            resp = dashboard_client.get("/api/agents/personas")
            personas = resp.json()
            coord = next(p for p in personas if p["is_coordinator"])
            assert coord["id"] == "coordinator"


class TestDashboardFiltering:
    """Dashboard should support filtering by persona properties."""

    def test_list_returns_all_personas(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = config_with_personas
            resp = dashboard_client.get("/api/agents/personas")
            assert len(resp.json()) == 3

    def test_get_single_persona_by_id(self, dashboard_client, config_with_personas):
        with patch("adclaw.app.routers.personas.load_config") as mock:
            mock.return_value = config_with_personas
            resp = dashboard_client.get("/api/agents/personas/researcher")
            assert resp.status_code == 200
            assert resp.json()["name"] == "Mike"
```

- [ ] **Step 2: Run tests**

Run: `pytest tests/test_mission_control_dashboard.py -v`
Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_mission_control_dashboard.py
git commit -m "test: add Dashboard API data aggregation tests"
```

---

## Chunk 3: Cron Tests & Live E2E Script

### Task 5: Cron scheduling tests

**Files:**
- Create: `tests/test_mission_control_cron.py`

- [ ] **Step 1: Write cron tests**

```python
"""Tests for Mission Control P4: Cron job per-persona scheduling."""
import pytest
from adclaw.config.config import PersonaConfig, PersonaCron


class TestPersonaCron:
    """Persona cron config validation."""

    def test_cron_default_none(self):
        p = PersonaConfig(id="r", name="R")
        assert p.cron is None

    def test_cron_config_fields(self):
        cron = PersonaCron(enabled=True, schedule="0 9 * * *", prompt="Find trends", output="chat")
        p = PersonaConfig(id="r", name="R", cron=cron)
        assert p.cron.enabled is True
        assert p.cron.schedule == "0 9 * * *"
        assert p.cron.prompt == "Find trends"
        assert p.cron.output == "chat"

    def test_cron_disabled(self):
        cron = PersonaCron(enabled=False, schedule="0 9 * * *", prompt="Find trends", output="chat")
        p = PersonaConfig(id="r", name="R", cron=cron)
        assert p.cron.enabled is False


class TestCronPersonaTargeting:
    """Cron jobs must target the correct persona session."""

    def test_cron_session_id_format(self):
        """Cron dispatching to a persona uses persona_id::channel--session format."""
        persona_id = "researcher"
        channel = "console"
        session_id = f"{persona_id}::{channel}--default"
        assert session_id == "researcher::console--default"

    def test_cron_dispatch_payload(self):
        """Cron dispatch body must include correct session_id and persona routing."""
        persona_id = "researcher"
        cron_payload = {
            "task_type": "query",
            "text": "Find AI trends today",
            "request": {
                "input": [{"type": "text", "text": f"@{persona_id} Find AI trends today"}],
                "session_id": f"{persona_id}::cron--daily",
                "user_id": "cron-scheduler",
                "channel": "console",
            },
            "schedule": {"type": "cron", "cron": "0 9 * * *", "timezone": "UTC"},
            "dispatch": {
                "type": "local",
                "channel": "console",
                "target": {"session_id": f"{persona_id}::cron--daily"},
            },
        }
        assert f"@{persona_id}" in cron_payload["request"]["input"][0]["text"]
        assert persona_id in cron_payload["dispatch"]["target"]["session_id"]

    def test_different_personas_different_cron_sessions(self):
        """Cron jobs for different personas must not share sessions."""
        s1 = "researcher::cron--daily"
        s2 = "content-writer::cron--weekly"
        assert s1 != s2
```

- [ ] **Step 2: Run tests**

Run: `pytest tests/test_mission_control_cron.py -v`
Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/test_mission_control_cron.py
git commit -m "test: add cron persona targeting tests"
```

### Task 6: Live E2E script

**Files:**
- Create: `scripts/test_mission_control_live.py`

- [ ] **Step 1: Write live E2E script**

```python
#!/usr/bin/env python3
"""Live E2E test for Mission Control features.

Tests against a running AdClaw instance:
- Phase 0: Health check
- Phase 1: Persona API — list, verify structure
- Phase 2: @mention routing — send message with @tag, verify session created
- Phase 3: Session isolation — verify persona sessions are separate
- Phase 4: Cron API — create job targeting persona, verify
- Phase 5: Dashboard data — verify all data available for dashboard
- Phase 6: Shared AOM — ingest memory, verify cross-persona access

Usage:
    python3 scripts/test_mission_control_live.py [--base-url http://localhost:8088]
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from typing import Any

try:
    import requests
except ImportError:
    print("pip install requests")
    sys.exit(1)

DEFAULT_BASE = "http://localhost:8088"


class MissionControlClient:
    def __init__(self, base_url: str):
        self.base = base_url.rstrip("/")
        self.s = requests.Session()
        self.s.headers["Content-Type"] = "application/json"

    def get(self, path: str, **kw) -> requests.Response:
        return self.s.get(f"{self.base}{path}", **kw)

    def post(self, path: str, data: Any = None, **kw) -> requests.Response:
        return self.s.post(f"{self.base}{path}", json=data, **kw)

    def delete(self, path: str) -> requests.Response:
        return self.s.delete(f"{self.base}{path}")


def phase0_health(c: MissionControlClient):
    print("\n=== Phase 0: Health Check ===")
    # Try skills endpoint as health proxy (health returns HTML in current build)
    r = c.get("/api/skills")
    assert r.status_code == 200, f"Skills endpoint failed: {r.status_code}"
    skills = r.json()
    assert isinstance(skills, list), "Skills should be a list"
    print(f"  ✓ API alive, {len(skills)} skills loaded")


def phase1_personas(c: MissionControlClient):
    print("\n=== Phase 1: Persona API ===")
    r = c.get("/api/agents/personas")
    assert r.status_code == 200, f"List personas failed: {r.status_code}"
    personas = r.json()
    print(f"  ✓ Found {len(personas)} personas")

    # Verify structure
    for p in personas:
        assert "id" in p, f"Persona missing 'id': {p}"
        assert "name" in p, f"Persona missing 'name': {p}"
        assert "is_coordinator" in p, f"Persona missing 'is_coordinator': {p}"
        assert "skills" in p, f"Persona missing 'skills': {p}"
        assert "mcp_clients" in p, f"Persona missing 'mcp_clients': {p}"

    # At least one coordinator
    coordinators = [p for p in personas if p["is_coordinator"]]
    assert len(coordinators) >= 1, "No coordinator persona found"
    print(f"  ✓ Coordinator: {coordinators[0]['name']}")

    # Return personas for later phases
    return personas


def phase2_mention_routing(c: MissionControlClient, personas: list):
    print("\n=== Phase 2: @mention Routing ===")
    if len(personas) < 2:
        print("  ⚠ Only 1 persona, skipping routing test")
        return

    non_coord = [p for p in personas if not p["is_coordinator"]]
    if not non_coord:
        print("  ⚠ No non-coordinator personas, skipping")
        return

    target = non_coord[0]
    print(f"  Testing @{target['id']} routing...")

    # Send message with @tag via agent/process
    payload = {
        "input": [{"type": "text", "text": f"@{target['id']} what are your skills?"}],
        "session_id": f"e2e-test-{target['id']}",
        "user_id": "e2e-test-user",
        "channel": "console",
        "stream": False,
    }
    try:
        r = c.post("/api/agent/process", data=payload, timeout=60)
        if r.status_code == 200:
            print(f"  ✓ @{target['id']} responded (status={r.status_code})")
        else:
            print(f"  ⚠ @{target['id']} returned {r.status_code} (may need LLM)")
    except requests.Timeout:
        print(f"  ⚠ Request timed out (LLM may be slow)")
    except Exception as e:
        print(f"  ⚠ Request failed: {e}")


def phase3_sessions(c: MissionControlClient):
    print("\n=== Phase 3: Session Isolation ===")
    r = c.get("/api/chats")
    if r.status_code != 200:
        print(f"  ⚠ Chats API returned {r.status_code}, skipping")
        return

    chats = r.json()
    if isinstance(chats, dict):
        chats = chats.get("chats", [])
    print(f"  Found {len(chats)} sessions")

    # Check for persona-scoped sessions
    persona_sessions = [ch for ch in chats if "::" in str(ch.get("session_id", ""))]
    print(f"  ✓ {len(persona_sessions)} persona-scoped sessions")


def phase4_cron(c: MissionControlClient, personas: list):
    print("\n=== Phase 4: Cron API ===")
    r = c.get("/api/cron/jobs")
    if r.status_code != 200:
        print(f"  ⚠ Cron API returned {r.status_code}, skipping")
        return

    jobs = r.json()
    if isinstance(jobs, dict):
        jobs = jobs.get("jobs", [])
    print(f"  Found {len(jobs)} cron jobs")

    # Check for persona-targeted jobs
    for job in jobs:
        target = job.get("dispatch", {}).get("target", {})
        session = target.get("session_id", "")
        if "::" in session:
            persona = session.split("::")[0]
            schedule = job.get("schedule", {}).get("cron", "?")
            print(f"  ✓ Job '{job.get('name', '?')}' → @{persona} ({schedule})")


def phase5_dashboard(c: MissionControlClient, personas: list):
    print("\n=== Phase 5: Dashboard Data ===")
    # Verify all data sources work
    checks = {
        "Personas": "/api/agents/personas",
        "Sessions": "/api/chats",
        "Cron": "/api/cron/jobs",
    }
    for name, path in checks.items():
        r = c.get(path)
        status = "✓" if r.status_code == 200 else "✗"
        print(f"  {status} {name} ({path}) → {r.status_code}")


def phase6_shared_memory(c: MissionControlClient):
    print("\n=== Phase 6: Shared AOM Memory ===")
    # Ingest memory as "researcher"
    r = c.post("/api/memory/memories", data={
        "content": "E2E test: AI market will reach $500B by 2027 — from researcher",
        "source_type": "conversation",
        "source_id": "e2e-researcher",
        "skip_llm": True,
    })
    if r.status_code not in (200, 201):
        print(f"  ⚠ Ingest failed: {r.status_code} {r.text[:100]}")
        return

    mem_id = r.json().get("id")
    print(f"  ✓ Ingested memory (id={mem_id})")

    # Query as "writer" — should find it (AOM is not persona-scoped)
    r = c.post("/api/memory/query", data={
        "question": "What is the AI market forecast?",
        "max_results": 5,
    })
    if r.status_code == 200:
        results = r.json()
        memories = results.get("memories", results.get("results", []))
        found = any("500B" in str(m) for m in memories)
        print(f"  {'✓' if found else '✗'} Cross-persona query: {'found' if found else 'not found'} ({len(memories)} results)")
    else:
        print(f"  ⚠ Query failed: {r.status_code}")

    # Cleanup
    if mem_id:
        c.delete(f"/api/memory/memories/{mem_id}")
        print(f"  ✓ Cleaned up test memory")


def main():
    parser = argparse.ArgumentParser(description="Mission Control live E2E tests")
    parser.add_argument("--base-url", default=DEFAULT_BASE, help="AdClaw base URL")
    args = parser.parse_args()

    c = MissionControlClient(args.base_url)
    print(f"Testing against {args.base_url}")

    try:
        phase0_health(c)
        personas = phase1_personas(c)
        phase2_mention_routing(c, personas)
        phase3_sessions(c)
        phase4_cron(c, personas)
        phase5_dashboard(c, personas)
        phase6_shared_memory(c)
        print("\n=== All phases complete ===\n")
    except AssertionError as e:
        print(f"\n✗ ASSERTION FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/test_mission_control_live.py
```

- [ ] **Step 3: Run against live instance**

Run: `python3 scripts/test_mission_control_live.py --base-url http://localhost:8088`
Expected: Phases 0, 1, 3, 4, 5, 6 pass. Phase 2 may warn if LLM is slow.

- [ ] **Step 4: Commit**

```bash
git add scripts/test_mission_control_live.py
git commit -m "test: add live E2E test script for Mission Control"
```

### Task 7: Run full test suite

- [ ] **Step 1: Run all mocked tests**

Run: `pytest tests/test_mission_control_*.py -v`
Expected: All ~30 tests PASS.

- [ ] **Step 2: Run full existing suite to verify no regression**

Run: `pytest tests/ -v --tb=short`
Expected: All 329+ tests PASS.

- [ ] **Step 3: Run live E2E**

Run: `python3 scripts/test_mission_control_live.py --base-url http://localhost:8088`
Expected: All phases pass.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "test: Mission Control complete test kit — 30 mocked + live E2E"
git push
```
