# Skill Self-Healing + Security Badges Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-fix broken skill YAML via user's LLM + show security scan badges on skill cards in web UI.

**Architecture:** New `skill_healer.py` module intercepts skill registration failures, sends SKILL.md + error to LLM for fix, retries once. `skill_security.py` computes score from existing scanner + caches in `.scan.json`. Frontend shows badges + score on each skill card.

**Tech Stack:** Python/FastAPI (backend), React/TypeScript/Ant Design (frontend), existing `SkillSecurityScanner` + `llm_audit_skill`.

---

### Task 1: Skill Healer — Backend Module

**Files:**
- Create: `src/adclaw/agents/skill_healer.py`
- Test: `tests/test_skill_healer.py`

**Step 1: Write the failing test**

```python
# tests/test_skill_healer.py
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from pathlib import Path
import tempfile
import os


@pytest.fixture
def broken_skill_dir(tmp_path):
    """Create a skill dir with broken YAML frontmatter."""
    skill_dir = tmp_path / "broken-skill"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text(
        '---\nname: broken\nmetadata: {"emoji":"\\ud83d\\udc26"}\n---\n# Broken'
    )
    return skill_dir


@pytest.fixture
def no_frontmatter_skill_dir(tmp_path):
    skill_dir = tmp_path / "no-fm-skill"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("# Just a heading\n\nSome content.")
    return skill_dir


@pytest.mark.asyncio
async def test_heal_broken_yaml(broken_skill_dir):
    from adclaw.agents.skill_healer import heal_skill

    fixed_content = '---\nname: broken\ndescription: A broken skill fixed.\nmetadata: {"emoji":"bird"}\n---\n# Broken'

    mock_llm = AsyncMock(return_value=fixed_content)

    result = await heal_skill(
        skill_dir=broken_skill_dir,
        error_message='found invalid Unicode character escape code',
        llm_caller=mock_llm,
    )

    assert result.healed is True
    assert result.original != result.fixed
    actual = (broken_skill_dir / "SKILL.md").read_text()
    assert "\\ud83d" not in actual


@pytest.mark.asyncio
async def test_heal_missing_frontmatter(no_frontmatter_skill_dir):
    from adclaw.agents.skill_healer import heal_skill

    fixed_content = '---\nname: no-fm-skill\ndescription: A skill without frontmatter.\n---\n# Just a heading\n\nSome content.'

    mock_llm = AsyncMock(return_value=fixed_content)

    result = await heal_skill(
        skill_dir=no_frontmatter_skill_dir,
        error_message="must have a YAML Front Matter including `name` and `description`",
        llm_caller=mock_llm,
    )

    assert result.healed is True
    actual = (no_frontmatter_skill_dir / "SKILL.md").read_text()
    assert "name: no-fm-skill" in actual


@pytest.mark.asyncio
async def test_heal_llm_fails_gracefully():
    import tempfile
    from adclaw.agents.skill_healer import heal_skill

    with tempfile.TemporaryDirectory() as tmp:
        skill_dir = Path(tmp) / "bad-skill"
        skill_dir.mkdir()
        (skill_dir / "SKILL.md").write_text("# No frontmatter")
        original = (skill_dir / "SKILL.md").read_text()

        mock_llm = AsyncMock(side_effect=Exception("LLM unavailable"))

        result = await heal_skill(
            skill_dir=skill_dir,
            error_message="missing frontmatter",
            llm_caller=mock_llm,
        )

        assert result.healed is False
        assert (skill_dir / "SKILL.md").read_text() == original


@pytest.mark.asyncio
async def test_heal_preserves_backup(broken_skill_dir):
    from adclaw.agents.skill_healer import heal_skill

    fixed = '---\nname: broken\ndescription: Fixed.\n---\n# Broken'
    mock_llm = AsyncMock(return_value=fixed)

    await heal_skill(broken_skill_dir, "error", mock_llm)

    backup = broken_skill_dir / "SKILL.md.bak"
    assert backup.exists()
    assert "\\ud83d" in backup.read_text()
```

**Step 2: Run tests to verify they fail**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_healer.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'adclaw.agents.skill_healer'`

**Step 3: Implement skill_healer.py**

```python
# src/adclaw/agents/skill_healer.py
"""Auto-heal broken skill YAML frontmatter using the user's LLM."""
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Awaitable, Optional

logger = logging.getLogger(__name__)

HEAL_PROMPT = """Fix the YAML frontmatter in this SKILL.md file. The error was:

{error}

The file content is:

```
{content}
```

Rules:
- The file MUST start with `---`, then YAML with at least `name` and `description` fields, then `---`
- Fix any YAML syntax errors, invalid unicode escapes, or missing fields
- The `name` field should be a simple lowercase-kebab-case identifier
- The `description` field should be a single English sentence
- Do NOT modify the markdown body after the closing `---`
- Return ONLY the complete fixed file content, no explanations"""


@dataclass
class HealResult:
    healed: bool
    skill_name: str
    original: str
    fixed: str
    error: str
    message: str = ""


async def heal_skill(
    skill_dir: Path,
    error_message: str,
    llm_caller: Callable[[str], Awaitable[str]],
) -> HealResult:
    """Attempt to fix a broken SKILL.md using LLM.

    Args:
        skill_dir: Path to the skill directory
        error_message: The error from registration
        llm_caller: Async function that sends prompt to LLM and returns response

    Returns:
        HealResult with healed=True if fix was applied
    """
    skill_name = skill_dir.name
    skill_file = skill_dir / "SKILL.md"

    if not skill_file.exists():
        return HealResult(
            healed=False, skill_name=skill_name,
            original="", fixed="", error=error_message,
            message="SKILL.md not found",
        )

    original = skill_file.read_text(encoding="utf-8")

    prompt = HEAL_PROMPT.format(error=error_message, content=original)

    try:
        fixed = await llm_caller(prompt)
    except Exception as e:
        logger.warning("LLM heal failed for '%s': %s", skill_name, e)
        return HealResult(
            healed=False, skill_name=skill_name,
            original=original, fixed="", error=error_message,
            message=f"LLM call failed: {e}",
        )

    # Strip markdown code fences if LLM wrapped the response
    fixed = fixed.strip()
    if fixed.startswith("```"):
        lines = fixed.split("\n")
        # Remove first line (```markdown or ```) and last line (```)
        if lines[-1].strip() == "```":
            lines = lines[1:-1]
        else:
            lines = lines[1:]
        fixed = "\n".join(lines)

    if not fixed or fixed == original:
        return HealResult(
            healed=False, skill_name=skill_name,
            original=original, fixed=fixed, error=error_message,
            message="LLM returned unchanged or empty content",
        )

    # Validate the fix has frontmatter
    if not fixed.startswith("---"):
        return HealResult(
            healed=False, skill_name=skill_name,
            original=original, fixed=fixed, error=error_message,
            message="LLM response missing frontmatter delimiters",
        )

    # Backup original and write fix
    backup = skill_dir / "SKILL.md.bak"
    backup.write_text(original, encoding="utf-8")
    skill_file.write_text(fixed, encoding="utf-8")

    logger.info(
        "Auto-healed skill '%s': %s", skill_name, error_message[:80]
    )

    return HealResult(
        healed=True, skill_name=skill_name,
        original=original, fixed=fixed, error=error_message,
        message=f"Fixed: {error_message[:80]}",
    )
```

**Step 4: Run tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_healer.py -v`
Expected: all 4 PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/skill_healer.py tests/test_skill_healer.py
git commit -m "feat: skill self-healer — LLM auto-fix for broken YAML frontmatter"
```

---

### Task 2: Integrate Healer into Skill Registration

**Files:**
- Modify: `src/adclaw/agents/react_agent.py:225-248`
- Test: `tests/test_skill_healer.py` (add integration test)

**Step 1: Write the failing test**

```python
# Append to tests/test_skill_healer.py

@pytest.mark.asyncio
async def test_register_with_healing(tmp_path):
    """Simulate _register_skills flow with healing."""
    from adclaw.agents.skill_healer import heal_skill

    skill_dir = tmp_path / "test-skill"
    skill_dir.mkdir()
    # Write broken frontmatter
    (skill_dir / "SKILL.md").write_text("# No frontmatter at all\nJust text.")

    fixed = '---\nname: test-skill\ndescription: Test skill.\n---\n# No frontmatter at all\nJust text.'
    mock_llm = AsyncMock(return_value=fixed)

    # First attempt would fail, heal, then retry should parse
    result = await heal_skill(skill_dir, "must have YAML Front Matter", mock_llm)
    assert result.healed is True

    # Verify the fixed file can be parsed by frontmatter
    import frontmatter
    post = frontmatter.load(str(skill_dir / "SKILL.md"))
    assert post["name"] == "test-skill"
    assert post["description"] == "Test skill."
```

**Step 2: Run test to verify it fails**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_healer.py::test_register_with_healing -v`
Expected: FAIL (module not yet created or test infra issue)

**Step 3: Modify react_agent._register_skills**

In `src/adclaw/agents/react_agent.py`, replace the `_register_skills` method:

```python
    def _register_skills(self, toolkit: Toolkit) -> None:
        """Load and register skills from working directory."""
        ensure_skills_initialized()

        working_skills_dir = get_working_skills_dir()
        available_skills = list_available_skills()

        for skill_name in available_skills:
            skill_dir = working_skills_dir / skill_name
            if skill_dir.exists():
                try:
                    toolkit.register_agent_skill(str(skill_dir))
                    logger.debug("Registered skill: %s", skill_name)
                except Exception as e:
                    logger.error(
                        "Failed to register skill '%s': %s", skill_name, e
                    )
                    # Attempt self-healing
                    self._heal_and_retry(toolkit, skill_dir, skill_name, e)

    def _heal_and_retry(
        self, toolkit: Toolkit, skill_dir, skill_name: str, error: Exception
    ) -> None:
        """Try to auto-heal a broken skill and retry registration."""
        import asyncio
        from .skill_healer import heal_skill

        llm_caller = self._get_llm_caller()
        if not llm_caller:
            return

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    result = pool.submit(
                        asyncio.run,
                        heal_skill(skill_dir, str(error), llm_caller)
                    ).result(timeout=30)
            else:
                result = asyncio.run(
                    heal_skill(skill_dir, str(error), llm_caller)
                )
        except Exception as heal_err:
            logger.warning("Self-heal failed for '%s': %s", skill_name, heal_err)
            return

        if not result.healed:
            return

        # Retry registration
        try:
            toolkit.register_agent_skill(str(skill_dir))
            logger.info(
                "Self-healed and registered skill '%s': %s",
                skill_name, result.message,
            )
            # Store heal event for UI notification
            self._heal_events.append({
                "skill": skill_name,
                "message": result.message,
            })
        except Exception as retry_err:
            logger.error(
                "Skill '%s' still broken after healing: %s",
                skill_name, retry_err,
            )
```

Add `self._heal_events: list = []` in `__init__`.

Add `_get_llm_caller` method that returns an async callable wrapping the agent's chat model.

**Step 4: Run tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_healer.py -v`
Expected: all PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/react_agent.py tests/test_skill_healer.py
git commit -m "feat: integrate skill healer into registration flow"
```

---

### Task 3: Security Score Calculator + Cache

**Files:**
- Create: `src/adclaw/agents/skill_security.py`
- Test: `tests/test_skill_security.py`

**Step 1: Write the failing test**

```python
# tests/test_skill_security.py
import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from adclaw.agents.skill_scanner import Finding, ScanResult


def test_compute_score_clean():
    from adclaw.agents.skill_security import compute_security_score
    scan = ScanResult(safe=True, skill_name="test", findings=[], files_scanned=3)
    assert compute_security_score(scan) == 100


def test_compute_score_critical():
    from adclaw.agents.skill_security import compute_security_score
    findings = [Finding(severity="critical", description="exec found")]
    scan = ScanResult(safe=False, skill_name="test", findings=findings, files_scanned=1)
    assert compute_security_score(scan) == 75


def test_compute_score_multiple():
    from adclaw.agents.skill_security import compute_security_score
    findings = [
        Finding(severity="critical", description="a"),
        Finding(severity="high", description="b"),
        Finding(severity="medium", description="c"),
        Finding(severity="low", description="d"),
    ]
    scan = ScanResult(safe=False, skill_name="test", findings=findings, files_scanned=2)
    # 100 - 25 - 15 - 8 - 3 = 49
    assert compute_security_score(scan) == 49


def test_compute_score_floor_zero():
    from adclaw.agents.skill_security import compute_security_score
    findings = [Finding(severity="critical", description="x")] * 5
    scan = ScanResult(safe=False, skill_name="test", findings=findings, files_scanned=1)
    assert compute_security_score(scan) == 0


def test_cache_write_and_read(tmp_path):
    from adclaw.agents.skill_security import write_scan_cache, read_scan_cache
    skill_dir = tmp_path / "test-skill"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("---\nname: test\n---\n# Test")

    data = {
        "score": 100,
        "pattern_scan": "pass",
        "llm_audit": "pending",
        "auto_healed": False,
        "findings": [],
    }
    write_scan_cache(skill_dir, data)

    cached = read_scan_cache(skill_dir)
    assert cached is not None
    assert cached["score"] == 100


def test_cache_invalidated_on_change(tmp_path):
    from adclaw.agents.skill_security import write_scan_cache, read_scan_cache
    skill_dir = tmp_path / "test-skill"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("---\nname: test\n---\n# V1")

    write_scan_cache(skill_dir, {"score": 100})

    # Modify the skill file
    (skill_dir / "SKILL.md").write_text("---\nname: test\n---\n# V2")

    cached = read_scan_cache(skill_dir)
    assert cached is None  # invalidated
```

**Step 2: Run tests — expect FAIL**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_security.py -v`

**Step 3: Implement skill_security.py**

```python
# src/adclaw/agents/skill_security.py
"""Security score computation and caching for skills."""
import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .skill_scanner import ScanResult

logger = logging.getLogger(__name__)

SEVERITY_DEDUCTIONS = {
    "critical": 25,
    "high": 15,
    "medium": 8,
    "low": 3,
}

CACHE_FILE = ".scan.json"


def compute_security_score(scan_result: ScanResult) -> int:
    """Compute 0-100 security score from scan findings."""
    score = 100
    for f in scan_result.findings:
        score -= SEVERITY_DEDUCTIONS.get(f.severity, 3)
    return max(0, score)


def _file_hash(skill_dir: Path) -> str:
    """Hash all scannable files in skill dir."""
    h = hashlib.sha256()
    for f in sorted(skill_dir.rglob("*")):
        if f.is_file() and f.name != CACHE_FILE and not f.name.endswith(".bak"):
            h.update(f.read_bytes())
    return h.hexdigest()


def write_scan_cache(skill_dir: Path, data: dict) -> None:
    """Write scan result cache."""
    data["file_hash"] = _file_hash(skill_dir)
    data["scanned_at"] = datetime.now(timezone.utc).isoformat()
    cache_path = skill_dir / CACHE_FILE
    cache_path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def read_scan_cache(skill_dir: Path) -> Optional[dict]:
    """Read cached scan result. Returns None if stale or missing."""
    cache_path = skill_dir / CACHE_FILE
    if not cache_path.exists():
        return None
    try:
        data = json.loads(cache_path.read_text(encoding="utf-8"))
        if data.get("file_hash") != _file_hash(skill_dir):
            return None
        return data
    except (json.JSONDecodeError, KeyError):
        return None


def scan_and_cache(skill_dir: Path, skill_name: str) -> dict:
    """Run pattern scan, compute score, cache result."""
    from .skill_scanner import SkillSecurityScanner

    cached = read_scan_cache(skill_dir)
    if cached is not None:
        return cached

    scanner = SkillSecurityScanner()
    result = scanner.scan_skill(skill_dir, skill_name)
    score = compute_security_score(result)

    data = {
        "score": score,
        "pattern_scan": "pass" if result.safe else "fail",
        "llm_audit": "pending",
        "auto_healed": False,
        "findings_count": len(result.findings),
        "findings": [
            {"severity": f.severity, "category": f.category, "description": f.description}
            for f in result.findings
        ],
    }
    write_scan_cache(skill_dir, data)
    return data
```

**Step 4: Run tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_security.py -v`
Expected: all 6 PASS

**Step 5: Commit**

```bash
git add src/adclaw/agents/skill_security.py tests/test_skill_security.py
git commit -m "feat: security score calculator with file-hash cache"
```

---

### Task 4: API — Add Security Data to Skills Endpoint

**Files:**
- Modify: `src/adclaw/app/routers/skills.py`
- Test: `tests/test_skill_security.py` (add API-level test)

**Step 1: Write the failing test**

```python
# Append to tests/test_skill_security.py

def test_scan_and_cache_integration(tmp_path):
    from adclaw.agents.skill_security import scan_and_cache

    skill_dir = tmp_path / "safe-skill"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("---\nname: safe-skill\ndescription: Safe.\n---\n# Safe")

    result = scan_and_cache(skill_dir, "safe-skill")
    assert result["score"] == 100
    assert result["pattern_scan"] == "pass"

    # Second call should use cache
    result2 = scan_and_cache(skill_dir, "safe-skill")
    assert result2["score"] == 100
```

**Step 2: Run — expect FAIL**

**Step 3: Add security summary to skills list endpoint**

In `src/adclaw/app/routers/skills.py`, modify the list endpoint to include security data. Find the GET endpoint that returns skills list and add `security` field by calling `read_scan_cache` for each skill.

**Step 4: Add `GET /skills/{name}/security` endpoint**

```python
@router.get("/{skill_name}/security")
async def get_skill_security(skill_name: str):
    """Get security scan results for a skill."""
    from ...agents.skill_security import scan_and_cache
    for base in (get_customized_skills_dir(), get_active_skills_dir()):
        skill_dir = base / skill_name
        if skill_dir.exists():
            return scan_and_cache(skill_dir, skill_name)
    raise HTTPException(status_code=404, detail=f"Skill '{skill_name}' not found")
```

**Step 5: Run tests and commit**

```bash
git add src/adclaw/app/routers/skills.py tests/test_skill_security.py
git commit -m "feat: security scan API endpoint + cache integration"
```

---

### Task 5: Frontend — Security Badges Component

**Files:**
- Create: `console/src/pages/Agent/Skills/components/SecurityBadges.tsx`
- Modify: `console/src/api/types/skill.ts` — add `security` field to `SkillSpec`
- Modify: `console/src/pages/Agent/Skills/components/SkillCard.tsx` — add badges

**Step 1: Add security type**

```typescript
// Add to console/src/api/types/skill.ts
export interface SkillSecurity {
  score: number;
  pattern_scan: "pass" | "fail" | "pending";
  llm_audit: "pass" | "fail" | "pending";
  auto_healed: boolean;
}
```

Add `security?: SkillSecurity;` to `SkillSpec`.

**Step 2: Create SecurityBadges component**

```tsx
// console/src/pages/Agent/Skills/components/SecurityBadges.tsx
import { Tooltip } from "@agentscope-ai/design";
import type { SkillSecurity } from "../../../../api/types";

const statusIcon = (status: string) => {
  switch (status) {
    case "pass": return "✅";
    case "fail": return "❌";
    default: return "⏳";
  }
};

const scoreColor = (score: number) => {
  if (score >= 80) return "#52c41a";
  if (score >= 50) return "#faad14";
  return "#f5222d";
};

interface Props {
  security?: SkillSecurity;
}

export function SecurityBadges({ security }: Props) {
  if (!security) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#bbb" }}>
        <span>Not scanned</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <Tooltip title={`Pattern scan: ${security.pattern_scan}`}>
        <span>🛡️{statusIcon(security.pattern_scan)}</span>
      </Tooltip>
      <Tooltip title={`LLM audit: ${security.llm_audit}`}>
        <span>🤖{statusIcon(security.llm_audit)}</span>
      </Tooltip>
      {security.auto_healed && (
        <Tooltip title="Auto-healed by LLM">
          <span>🔧</span>
        </Tooltip>
      )}
      <span style={{
        fontWeight: 600,
        color: scoreColor(security.score),
        marginLeft: "auto",
      }}>
        {security.score}/100
      </span>
    </div>
  );
}
```

**Step 3: Add badges to SkillCard**

In `SkillCard.tsx`, import `SecurityBadges` and add between description and footer:

```tsx
<SecurityBadges security={skill.security} />
```

**Step 4: Build and verify**

Run: `cd /root/AdClaw/console && npm run build`
Expected: builds without errors

**Step 5: Commit**

```bash
git add console/src/pages/Agent/Skills/components/SecurityBadges.tsx \
      console/src/api/types/skill.ts \
      console/src/pages/Agent/Skills/components/SkillCard.tsx
git commit -m "feat: security badges UI — pattern scan, LLM audit, score"
```

---

### Task 6: Auto-Scan on Skill Create/Update

**Files:**
- Modify: `src/adclaw/app/routers/skills.py` — trigger scan on create/update
- Modify: `src/adclaw/agents/skills_manager.py` — trigger scan on sync

**Step 1: Add scan trigger after skill creation/update**

In the skills router, after a skill is created or updated, call `scan_and_cache()`. Add to the create/update endpoints:

```python
from ...agents.skill_security import scan_and_cache
# After skill is written to disk:
scan_and_cache(skill_dir, skill_name)
```

**Step 2: Add scan trigger in skills_manager.sync_skills_to_working_dir**

After syncing a skill, run `scan_and_cache` on the target directory.

**Step 3: Commit**

```bash
git add src/adclaw/app/routers/skills.py src/adclaw/agents/skills_manager.py
git commit -m "feat: auto-scan skills on create, update, and sync"
```

---

### Task 7: Tests — Full Coverage

**Files:**
- Modify: `tests/test_skill_healer.py`
- Modify: `tests/test_skill_security.py`

**Step 1: Run all tests**

Run: `cd /root/AdClaw && python -m pytest tests/test_skill_healer.py tests/test_skill_security.py -v`
Expected: all PASS

**Step 2: Commit**

```bash
git commit --allow-empty -m "test: verify all skill healer + security tests pass"
```

---

### Task 8: Update README + Build + Deploy + E2E Test

**Files:**
- Modify: `README.md` — add Self-Healing & Security section

**Step 1: Add feature section to README**

Add under features:

```markdown
### Self-Healing Skills & Security Badges
- Broken skill YAML? Auto-fixed by your LLM — no manual intervention
- Every skill gets a security score (0-100) from 208-pattern static analysis
- Visual badges on each skill card: pattern scan, LLM audit, auto-heal status
- Scans cached and invalidated automatically when files change
```

**Step 2: Build frontend**

Run: `cd /root/AdClaw/console && npm run build`

**Step 3: Build Docker image**

Run: `cd /root/AdClaw && docker build -t nttylock/adclaw:latest -f deploy/Dockerfile .`

**Step 4: Deploy**

```bash
docker rm -f adclaw
docker run -d --name adclaw --restart unless-stopped \
  -p 8088:8088 \
  -v copaw-data:/app/working \
  -v copaw-secret:/app/working.secret \
  -e ADCLAW_ENABLED_CHANNELS=discord,dingtalk,feishu,qq,console,telegram \
  -e LOG_LEVEL=DEBUG \
  nttylock/adclaw:latest
```

**Step 5: E2E test — break a skill and verify self-healing**

```bash
# Break a skill's YAML
docker exec adclaw sh -c 'echo "# No frontmatter" > /app/working/active_skills/self-setup/SKILL.md'

# Restart to trigger registration
docker restart adclaw

# Wait for startup, check logs
sleep 30
docker logs adclaw 2>&1 | grep -i "self-heal\|auto-heal"
# Expected: "Auto-healed skill 'self-setup': ..."

# Verify skill is registered
curl -s http://localhost:8088/api/skills | python3 -c "
import sys, json
skills = json.load(sys.stdin)
ss = next((s for s in skills if s['name'] == 'self-setup'), None)
print(f'self-setup registered: {ss is not None}')
if ss and ss.get('security'):
    print(f'security score: {ss[\"security\"][\"score\"]}')
"
```

**Step 6: Commit all and push**

```bash
git add -A
git commit -m "feat: skill self-healing + security badges — full implementation

- Auto-fix broken YAML frontmatter via user's LLM
- 0-100 security score from 208-pattern scanner
- UI badges: pattern scan, LLM audit, auto-heal indicator
- File-hash caching, auto-scan on create/update
- Tests + README update"
git push origin main
```
