# Diagnostics & Self-Healing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give AdClaw users a diagnostics dashboard showing all subsystem health, error logs, restart button, and auto-recovery watchdog — so when the bot breaks, users can see why and fix it without SSH access.

**Architecture:** New `/api/diagnostics` REST router aggregates live status from all managers (LLM, channels, MCP, AOM, crons) already on `app.state`. A watchdog asyncio task in lifespan pings the agent every 60s and auto-restarts the runner on failure. Console gets a new `/diagnostics` page with status cards, error log viewer, and restart button.

**Tech Stack:** FastAPI router, asyncio watchdog, existing Ant Design components (Card, Tag, Button, Table, Alert), React hooks.

---

### Task 1: Diagnostics API Router (Backend)

**Files:**
- Create: `src/adclaw/app/routers/diagnostics.py`
- Modify: `src/adclaw/app/routers/__init__.py` — register new router
- Test: `tests/test_diagnostics_api.py`

**Step 1: Write the failing test**

```python
# tests/test_diagnostics_api.py
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_app():
    """Create a minimal FastAPI app with diagnostics router."""
    from fastapi import FastAPI
    from adclaw.app.routers.diagnostics import router

    app = FastAPI()
    app.include_router(router, prefix="/api")

    # Mock app.state subsystems
    app.state.runner = MagicMock()
    app.state.runner.memory_manager = MagicMock()

    app.state.channel_manager = MagicMock()
    app.state.channel_manager.channels = []

    app.state.mcp_manager = MagicMock()
    app.state.mcp_manager._clients = {}

    app.state.cron_manager = MagicMock()
    app.state.cron_manager._scheduler = MagicMock()
    app.state.cron_manager._scheduler.get_jobs.return_value = []

    app.state.aom_manager = None
    app.state.config_watcher = MagicMock()

    return app


@pytest.fixture
def client(mock_app):
    return TestClient(mock_app)


def test_health_returns_ok(client):
    resp = client.get("/api/diagnostics/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("healthy", "degraded", "unhealthy")
    assert "uptime_seconds" in data
    assert "subsystems" in data


def test_health_subsystems_structure(client):
    resp = client.get("/api/diagnostics/health")
    data = resp.json()
    subs = data["subsystems"]
    for key in ("llm", "channels", "mcp", "crons"):
        assert key in subs
        assert "status" in subs[key]


def test_health_llm_not_configured(client):
    """When no active LLM, llm status should be 'error'."""
    with patch(
        "adclaw.app.routers.diagnostics._get_llm_status",
        return_value={"status": "error", "detail": "No active LLM"},
    ):
        resp = client.get("/api/diagnostics/health")
        data = resp.json()
        assert data["subsystems"]["llm"]["status"] == "error"


def test_errors_endpoint(client):
    resp = client.get("/api/diagnostics/errors")
    assert resp.status_code == 200
    data = resp.json()
    assert "errors" in data
    assert isinstance(data["errors"], list)


def test_errors_with_limit(client):
    resp = client.get("/api/diagnostics/errors?limit=5")
    assert resp.status_code == 200


def test_restart_endpoint(client):
    resp = client.post("/api/diagnostics/restart")
    assert resp.status_code == 200
    data = resp.json()
    assert "restarted" in data
```

**Step 2: Run test to verify it fails**

Run: `cd /tmp/AdClaw && python -m pytest tests/test_diagnostics_api.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'adclaw.app.routers.diagnostics'`

**Step 3: Write the diagnostics router**

```python
# src/adclaw/app/routers/diagnostics.py
# -*- coding: utf-8 -*-
"""Diagnostics & health check API for AdClaw subsystems."""
import logging
import os
import re
import time
from pathlib import Path

from fastapi import APIRouter, Request
from pydantic import BaseModel

from ...config import load_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])

_START_TIME = time.time()


class SubsystemStatus(BaseModel):
    status: str  # "ok" | "warning" | "error"
    detail: str = ""
    count: int | None = None


class HealthResponse(BaseModel):
    status: str  # "healthy" | "degraded" | "unhealthy"
    uptime_seconds: float
    subsystems: dict[str, SubsystemStatus]


class ErrorEntry(BaseModel):
    timestamp: str
    level: str
    message: str
    traceback: str = ""


def _get_llm_status() -> dict:
    """Check if LLM provider is configured and active."""
    try:
        config = load_config()
        active = getattr(config, "active_llm", None)
        if active and active.provider_id:
            return {
                "status": "ok",
                "detail": f"{active.provider_id}/{active.model}",
            }
        return {"status": "error", "detail": "No active LLM configured"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _get_channels_status(request: Request) -> dict:
    """Get status of all communication channels."""
    mgr = getattr(request.app.state, "channel_manager", None)
    if mgr is None:
        return {"status": "error", "detail": "Channel manager not initialized"}
    channels = getattr(mgr, "channels", [])
    names = [getattr(ch, "channel", "?") for ch in channels]
    if not channels:
        return {"status": "warning", "detail": "No channels configured"}
    return {
        "status": "ok",
        "detail": ", ".join(names),
        "count": len(channels),
    }


def _get_mcp_status(request: Request) -> dict:
    """Get status of MCP clients."""
    mgr = getattr(request.app.state, "mcp_manager", None)
    if mgr is None:
        return {"status": "warning", "detail": "MCP manager not initialized"}
    clients = getattr(mgr, "_clients", {})
    if not clients:
        return {"status": "ok", "detail": "No MCP clients configured", "count": 0}
    return {
        "status": "ok",
        "detail": ", ".join(clients.keys()),
        "count": len(clients),
    }


def _get_cron_status(request: Request) -> dict:
    """Get status of cron jobs."""
    mgr = getattr(request.app.state, "cron_manager", None)
    if mgr is None:
        return {"status": "warning", "detail": "Cron manager not initialized"}
    try:
        scheduler = getattr(mgr, "_scheduler", None)
        jobs = scheduler.get_jobs() if scheduler else []
        return {
            "status": "ok",
            "detail": f"{len(jobs)} job(s) scheduled",
            "count": len(jobs),
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _get_aom_status(request: Request) -> dict:
    """Get status of Always-On Memory."""
    mgr = getattr(request.app.state, "aom_manager", None)
    if mgr is None:
        return {"status": "ok", "detail": "Disabled"}
    try:
        store = getattr(mgr, "store", None)
        if store:
            return {"status": "ok", "detail": "Running"}
        return {"status": "warning", "detail": "Manager exists but store not ready"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
    """Aggregate health status of all subsystems."""
    subsystems = {
        "llm": SubsystemStatus(**_get_llm_status()),
        "channels": SubsystemStatus(**_get_channels_status(request)),
        "mcp": SubsystemStatus(**_get_mcp_status(request)),
        "crons": SubsystemStatus(**_get_cron_status(request)),
        "aom": SubsystemStatus(**_get_aom_status(request)),
    }

    statuses = [s.status for s in subsystems.values()]
    if all(s == "ok" for s in statuses):
        overall = "healthy"
    elif any(s == "error" for s in statuses):
        overall = "degraded"
    else:
        overall = "healthy"

    return HealthResponse(
        status=overall,
        uptime_seconds=round(time.time() - _START_TIME, 1),
        subsystems=subsystems,
    )


_ERROR_LINE_RE = re.compile(
    r"^(ERROR|WARNING|CRITICAL)\s+.*?\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*\|\s*(.*)"
)
_TRACEBACK_RE = re.compile(r"^(Traceback |  File |    |\w+Error:|\w+Exception:)")


def _parse_error_log(log_path: str, limit: int = 50) -> list[dict]:
    """Parse app.err.log for ERROR/WARNING lines with tracebacks."""
    path = Path(log_path)
    if not path.exists():
        return []

    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    errors: list[dict] = []
    current: dict | None = None

    for line in lines:
        m = _ERROR_LINE_RE.match(line)
        if m:
            if current:
                errors.append(current)
            current = {
                "level": m.group(1),
                "timestamp": m.group(2),
                "message": m.group(3).strip(),
                "traceback": "",
            }
        elif current and _TRACEBACK_RE.match(line):
            current["traceback"] += line + "\n"

    if current:
        errors.append(current)

    # Return last N errors (most recent last)
    return errors[-limit:]


@router.get("/errors")
async def get_errors(limit: int = 50):
    """Get recent errors from application log."""
    log_path = "/var/log/app.err.log"
    errors = _parse_error_log(log_path, limit=limit)
    return {"errors": errors, "log_path": log_path, "total": len(errors)}


@router.post("/restart")
async def restart_agent(request: Request):
    """Restart the agent runner (re-initialize LLM, memory, etc.)."""
    runner = getattr(request.app.state, "runner", None)
    if runner is None:
        return {"restarted": False, "error": "Runner not available"}

    try:
        # Stop and reinitialize the runner
        try:
            if hasattr(runner, "memory_manager") and runner.memory_manager:
                await runner.memory_manager.close()
        except Exception:
            pass

        runner.memory_manager = None
        await runner.init_handler()

        return {"restarted": True}
    except Exception as e:
        logger.exception("Restart failed: %s", e)
        return {"restarted": False, "error": str(e)}
```

**Step 4: Register the router**

In `src/adclaw/app/routers/__init__.py`, add:
```python
from .diagnostics import router as diagnostics_router
# ... after existing includes:
router.include_router(diagnostics_router)
```

**Step 5: Run tests to verify they pass**

Run: `cd /tmp/AdClaw && python -m pytest tests/test_diagnostics_api.py -v`
Expected: All 6 tests PASS

**Step 6: Commit**

```bash
git add src/adclaw/app/routers/diagnostics.py src/adclaw/app/routers/__init__.py tests/test_diagnostics_api.py
git commit -m "feat: add diagnostics API — health, errors, restart endpoints"
```

---

### Task 2: Agent Watchdog (Auto-Restart on Crash)

**Files:**
- Create: `src/adclaw/app/watchdog.py`
- Modify: `src/adclaw/app/_app.py` — start watchdog in lifespan
- Test: `tests/test_watchdog.py`

**Step 1: Write the failing test**

```python
# tests/test_watchdog.py
import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture
def mock_runner():
    runner = MagicMock()
    runner.init_handler = AsyncMock()
    runner.memory_manager = MagicMock()
    runner.memory_manager.close = AsyncMock()
    return runner


@pytest.mark.asyncio
async def test_watchdog_detects_healthy(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    wd = AgentWatchdog(runner=mock_runner, check_interval=0.1)
    # Healthy: memory_manager exists
    assert wd.is_healthy() is True


@pytest.mark.asyncio
async def test_watchdog_detects_unhealthy(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    mock_runner.memory_manager = None  # broken
    wd = AgentWatchdog(runner=mock_runner, check_interval=0.1)
    assert wd.is_healthy() is False


@pytest.mark.asyncio
async def test_watchdog_auto_restarts(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    mock_runner.memory_manager = None  # broken
    wd = AgentWatchdog(
        runner=mock_runner,
        check_interval=0.05,
        max_restarts=1,
    )
    task = asyncio.create_task(wd.start())
    await asyncio.sleep(0.2)
    wd.stop()
    await task

    # Should have attempted restart
    mock_runner.init_handler.assert_called()


@pytest.mark.asyncio
async def test_watchdog_respects_max_restarts(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    mock_runner.memory_manager = None
    mock_runner.init_handler = AsyncMock(
        side_effect=Exception("still broken")
    )
    wd = AgentWatchdog(
        runner=mock_runner,
        check_interval=0.05,
        max_restarts=2,
    )
    task = asyncio.create_task(wd.start())
    await asyncio.sleep(0.4)
    wd.stop()
    await task

    assert wd.restart_count <= 2


@pytest.mark.asyncio
async def test_watchdog_resets_count_on_success(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    call_count = 0

    async def flaky_init():
        nonlocal call_count
        call_count += 1
        mock_runner.memory_manager = MagicMock()  # fix it

    mock_runner.memory_manager = None
    mock_runner.init_handler = AsyncMock(side_effect=flaky_init)

    wd = AgentWatchdog(
        runner=mock_runner,
        check_interval=0.05,
        max_restarts=3,
    )
    task = asyncio.create_task(wd.start())
    await asyncio.sleep(0.3)
    wd.stop()
    await task

    # After successful restart, count should reset
    assert wd.restart_count == 0


@pytest.mark.asyncio
async def test_watchdog_get_status(mock_runner):
    from adclaw.app.watchdog import AgentWatchdog

    wd = AgentWatchdog(runner=mock_runner, check_interval=60)
    status = wd.get_status()
    assert "healthy" in status
    assert "restart_count" in status
    assert "last_check" in status
```

**Step 2: Run test to verify it fails**

Run: `cd /tmp/AdClaw && python -m pytest tests/test_watchdog.py -v`
Expected: FAIL — `ModuleNotFoundError`

**Step 3: Write the watchdog**

```python
# src/adclaw/app/watchdog.py
# -*- coding: utf-8 -*-
"""Agent watchdog — monitors runner health and auto-restarts on failure."""
import asyncio
import logging
import time

logger = logging.getLogger(__name__)


class AgentWatchdog:
    """Periodically checks if the agent runner is healthy.
    Auto-restarts on failure up to max_restarts times.
    """

    def __init__(
        self,
        runner,
        check_interval: float = 60.0,
        max_restarts: int = 5,
    ):
        self._runner = runner
        self._check_interval = check_interval
        self._max_restarts = max_restarts
        self._running = False
        self.restart_count = 0
        self.last_check: float = 0
        self.last_restart: float = 0

    def is_healthy(self) -> bool:
        """Check if the runner is in a healthy state."""
        try:
            if self._runner is None:
                return False
            if self._runner.memory_manager is None:
                return False
            return True
        except Exception:
            return False

    def get_status(self) -> dict:
        return {
            "healthy": self.is_healthy(),
            "restart_count": self.restart_count,
            "max_restarts": self._max_restarts,
            "last_check": self.last_check,
            "last_restart": self.last_restart,
            "check_interval": self._check_interval,
        }

    async def _try_restart(self) -> bool:
        """Attempt to restart the runner."""
        logger.warning(
            "Watchdog: agent unhealthy, attempting restart (%d/%d)",
            self.restart_count + 1,
            self._max_restarts,
        )
        try:
            if hasattr(self._runner, "memory_manager") and self._runner.memory_manager:
                try:
                    await self._runner.memory_manager.close()
                except Exception:
                    pass
            self._runner.memory_manager = None
            await self._runner.init_handler()
            self.last_restart = time.time()

            if self.is_healthy():
                logger.info("Watchdog: restart successful, agent healthy")
                self.restart_count = 0
                return True
            else:
                self.restart_count += 1
                logger.error("Watchdog: restart completed but agent still unhealthy")
                return False
        except Exception as e:
            self.restart_count += 1
            logger.exception("Watchdog: restart failed: %s", e)
            return False

    async def start(self) -> None:
        """Run the watchdog loop."""
        self._running = True
        logger.info(
            "Watchdog started (interval=%ss, max_restarts=%d)",
            self._check_interval,
            self._max_restarts,
        )
        while self._running:
            await asyncio.sleep(self._check_interval)
            if not self._running:
                break
            self.last_check = time.time()

            if not self.is_healthy():
                if self.restart_count >= self._max_restarts:
                    logger.error(
                        "Watchdog: max restarts (%d) reached, giving up",
                        self._max_restarts,
                    )
                    continue
                await self._try_restart()

    def stop(self) -> None:
        """Stop the watchdog loop."""
        self._running = False
```

**Step 4: Wire watchdog into lifespan**

In `src/adclaw/app/_app.py`, after `app.state.aom_manager = aom_manager`:

```python
    # --- Agent watchdog (auto-restart on crash) ---
    from .watchdog import AgentWatchdog
    watchdog = AgentWatchdog(runner=runner, check_interval=60, max_restarts=5)
    watchdog_task = asyncio.create_task(watchdog.start())
    app.state.watchdog = watchdog
```

And in the `finally` block, before stopping runner:

```python
        if hasattr(app.state, "watchdog"):
            app.state.watchdog.stop()
```

**Step 5: Add watchdog status to diagnostics health endpoint**

In `diagnostics.py`, add to `health_check()`:

```python
    # Watchdog status
    wd = getattr(request.app.state, "watchdog", None)
    if wd:
        wd_status = wd.get_status()
        subsystems["watchdog"] = SubsystemStatus(
            status="ok" if wd_status["healthy"] else "warning",
            detail=f"restarts: {wd_status['restart_count']}/{wd_status['max_restarts']}",
        )
```

**Step 6: Run tests**

Run: `cd /tmp/AdClaw && python -m pytest tests/test_watchdog.py tests/test_diagnostics_api.py -v`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add src/adclaw/app/watchdog.py src/adclaw/app/_app.py tests/test_watchdog.py
git commit -m "feat: add agent watchdog — auto-restarts runner on crash"
```

---

### Task 3: Diagnostics Console Page (Frontend)

**Files:**
- Create: `console/src/pages/Control/Diagnostics/index.tsx`
- Create: `console/src/api/modules/diagnostics.ts`
- Modify: `console/src/api/index.ts` — export diagnostics module
- Modify: `console/src/layouts/MainLayout/index.tsx` — add route
- Modify: `console/src/layouts/Sidebar.tsx` — add nav item

**Step 1: Create the API module**

```typescript
// console/src/api/modules/diagnostics.ts
import { request } from "../request";

export interface SubsystemStatus {
  status: "ok" | "warning" | "error";
  detail: string;
  count?: number;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  uptime_seconds: number;
  subsystems: Record<string, SubsystemStatus>;
}

export interface ErrorEntry {
  timestamp: string;
  level: string;
  message: string;
  traceback: string;
}

export interface ErrorsResponse {
  errors: ErrorEntry[];
  log_path: string;
  total: number;
}

export const diagnosticsApi = {
  getHealth: () => request<HealthResponse>("/diagnostics/health"),

  getErrors: (limit = 50) =>
    request<ErrorsResponse>(`/diagnostics/errors?limit=${limit}`),

  restart: () =>
    request<{ restarted: boolean; error?: string }>("/diagnostics/restart", {
      method: "POST",
    }),
};
```

**Step 2: Register in API index**

In `console/src/api/index.ts`, add:
```typescript
import { diagnosticsApi } from "./modules/diagnostics";
// In the api object:
  ...diagnosticsApi,
```

**Step 3: Create the Diagnostics page**

```tsx
// console/src/pages/Control/Diagnostics/index.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Tag,
  Button,
  Table,
  Alert,
  Space,
  Modal,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import {
  RefreshCw,
  Heart,
  AlertTriangle,
  XCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { diagnosticsApi } from "../../../api/modules/diagnostics";
import type {
  HealthResponse,
  ErrorEntry,
  SubsystemStatus,
} from "../../../api/modules/diagnostics";

const { Text } = Typography;

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  ok: {
    color: "success",
    icon: <CheckCircle size={14} />,
    label: "OK",
  },
  warning: {
    color: "warning",
    icon: <AlertTriangle size={14} />,
    label: "Warning",
  },
  error: {
    color: "error",
    icon: <XCircle size={14} />,
    label: "Error",
  },
};

function SubsystemCard({
  name,
  status,
}: {
  name: string;
  status: SubsystemStatus;
}) {
  const cfg = STATUS_CONFIG[status.status] || STATUS_CONFIG.error;
  return (
    <Card size="small" style={{ minWidth: 200 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text strong style={{ textTransform: "uppercase", fontSize: 13 }}>
          {name}
        </Text>
        <Tag color={cfg.color} icon={cfg.icon}>
          {cfg.label}
        </Tag>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {status.detail}
      </Text>
      {status.count != null && (
        <Text
          type="secondary"
          style={{ fontSize: 12, display: "block", marginTop: 4 }}
        >
          Count: {status.count}
        </Text>
      )}
    </Card>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [h, e] = await Promise.all([
        diagnosticsApi.getHealth(),
        diagnosticsApi.getErrors(100),
      ]);
      setHealth(h);
      setErrors(e.errors);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRestart = () => {
    Modal.confirm({
      title: "Restart Agent?",
      content:
        "This will reinitialize the LLM connection and memory manager. Active conversations may be interrupted.",
      okText: "Restart",
      okButtonProps: { danger: true },
      onOk: async () => {
        setRestarting(true);
        try {
          const res = await diagnosticsApi.restart();
          if (res.restarted) {
            Modal.success({ title: "Agent restarted successfully" });
          } else {
            Modal.error({
              title: "Restart failed",
              content: res.error,
            });
          }
        } catch {
          Modal.error({ title: "Restart request failed" });
        } finally {
          setRestarting(false);
          fetchData();
        }
      },
    });
  };

  const errorColumns = [
    {
      title: "Time",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 160,
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 90,
      render: (level: string) => (
        <Tag color={level === "ERROR" ? "error" : "warning"}>{level}</Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
  ];

  if (loading && !health) return <Spin size="large" />;

  const overallColor =
    health?.status === "healthy"
      ? "success"
      : health?.status === "degraded"
        ? "warning"
        : "error";

  return (
    <div style={{ padding: 24 }}>
      {/* Overall status banner */}
      <Alert
        type={
          health?.status === "healthy"
            ? "success"
            : health?.status === "degraded"
              ? "warning"
              : "error"
        }
        message={
          <Space>
            <Heart size={16} />
            <span>
              System {health?.status || "unknown"} — uptime{" "}
              {health ? formatUptime(health.uptime_seconds) : "?"}
            </span>
          </Space>
        }
        style={{ marginBottom: 16 }}
        action={
          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<RefreshCw size={14} />}
                onClick={fetchData}
                loading={loading}
                size="small"
              />
            </Tooltip>
            <Button
              icon={<RotateCcw size={14} />}
              onClick={handleRestart}
              loading={restarting}
              danger
              size="small"
            >
              Restart
            </Button>
          </Space>
        }
      />

      {/* Subsystem cards */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {health &&
          Object.entries(health.subsystems).map(([name, status]) => (
            <SubsystemCard key={name} name={name} status={status} />
          ))}
      </div>

      {/* Error log */}
      <Card title="Recent Errors" size="small">
        <Table
          dataSource={errors.map((e, i) => ({ ...e, key: i }))}
          columns={errorColumns}
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          expandable={{
            expandedRowRender: (record: ErrorEntry) =>
              record.traceback ? (
                <pre
                  style={{
                    fontSize: 11,
                    maxHeight: 300,
                    overflow: "auto",
                    background: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {record.traceback}
                </pre>
              ) : (
                <Text type="secondary">No traceback</Text>
              ),
          }}
          locale={{ emptyText: "No errors recorded" }}
        />
      </Card>
    </div>
  );
}
```

**Step 4: Wire into routing**

In `console/src/layouts/MainLayout/index.tsx`:
```typescript
import DiagnosticsPage from "../../pages/Control/Diagnostics";
// Add to pathToKey:
  "/diagnostics": "diagnostics",
// Add Route:
  <Route path="/diagnostics" element={<DiagnosticsPage />} />
```

In `console/src/layouts/Sidebar.tsx`:
```typescript
import { ..., HeartPulse } from "lucide-react";
// Add to keyToPath:
  diagnostics: "/diagnostics",
// Add to control-group children after heartbeat:
  {
    key: "diagnostics",
    label: t("nav.diagnostics"),
    icon: <HeartPulse size={16} />,
  },
```

**Step 5: Commit**

```bash
git add console/src/pages/Control/Diagnostics/index.tsx \
      console/src/api/modules/diagnostics.ts \
      console/src/api/index.ts \
      console/src/layouts/MainLayout/index.tsx \
      console/src/layouts/Sidebar.tsx
git commit -m "feat: add Diagnostics page — health status, error log, restart button"
```

---

### Task 4: Build Console and Integration Test

**Step 1: Build the console**

Run: `cd /tmp/AdClaw/console && npm ci && npm run build`
Expected: Build succeeds, output in `dist/` or `../src/adclaw/console/`

**Step 2: Run all tests**

Run: `cd /tmp/AdClaw && python -m pytest tests/test_diagnostics_api.py tests/test_watchdog.py -v`
Expected: All tests PASS

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: build console with diagnostics page"
```

---

### Summary of New/Modified Files

| Action | Path |
|--------|------|
| Create | `src/adclaw/app/routers/diagnostics.py` |
| Create | `src/adclaw/app/watchdog.py` |
| Create | `tests/test_diagnostics_api.py` |
| Create | `tests/test_watchdog.py` |
| Create | `console/src/pages/Control/Diagnostics/index.tsx` |
| Create | `console/src/api/modules/diagnostics.ts` |
| Modify | `src/adclaw/app/routers/__init__.py` |
| Modify | `src/adclaw/app/_app.py` |
| Modify | `console/src/api/index.ts` |
| Modify | `console/src/layouts/MainLayout/index.tsx` |
| Modify | `console/src/layouts/Sidebar.tsx` |

### Verification

```bash
# All diagnostics tests
cd /tmp/AdClaw && python -m pytest tests/test_diagnostics_api.py tests/test_watchdog.py -v

# Full test suite (no regressions)
python -m pytest tests/ -v --ignore=tests/test_aom_integration.py

# Console build
cd /tmp/AdClaw/console && npm run build
```
