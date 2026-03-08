# -*- coding: utf-8 -*-
"""Skill security scanner — static analysis of skill scripts before installation."""

from __future__ import annotations

import ast
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class Finding:
    """A security finding in a skill file."""

    severity: str  # "critical", "high", "medium", "low"
    file: str
    line: int
    description: str
    code_snippet: str = ""

    def __str__(self) -> str:
        return f"[{self.severity.upper()}] {self.file}:{self.line} — {self.description}"


@dataclass
class ScanResult:
    """Result of a skill security scan."""

    safe: bool
    skill_name: str
    findings: List[Finding] = field(default_factory=list)
    files_scanned: int = 0

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "critical")

    @property
    def high_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "high")

    def to_dict(self) -> dict:
        return {
            "safe": self.safe,
            "skill_name": self.skill_name,
            "files_scanned": self.files_scanned,
            "findings": [
                {
                    "severity": f.severity,
                    "file": f.file,
                    "line": f.line,
                    "description": f.description,
                    "code_snippet": f.code_snippet,
                }
                for f in self.findings
            ],
            "summary": {
                "critical": self.critical_count,
                "high": self.high_count,
                "total": len(self.findings),
            },
        }


# --- Dangerous AST node detectors ---

# Functions/attributes that are always dangerous
_DANGEROUS_CALLS = {
    "eval": "critical",
    "exec": "critical",
    "compile": "high",
    "__import__": "high",
    "breakpoint": "medium",
}

# Dangerous module.function patterns
_DANGEROUS_ATTRS = {
    ("os", "system"): ("critical", "os.system() — arbitrary command execution"),
    ("os", "popen"): ("critical", "os.popen() — arbitrary command execution"),
    ("os", "exec"): ("critical", "os.exec*() — process replacement"),
    ("os", "execvp"): ("critical", "os.execvp() — process replacement"),
    ("os", "execve"): ("critical", "os.execve() — process replacement"),
    ("os", "spawn"): ("high", "os.spawn*() — process spawning"),
    ("os", "remove"): ("medium", "os.remove() — file deletion"),
    ("os", "unlink"): ("medium", "os.unlink() — file deletion"),
    ("os", "rmdir"): ("medium", "os.rmdir() — directory deletion"),
    ("shutil", "rmtree"): ("high", "shutil.rmtree() — recursive directory deletion"),
    ("subprocess", "call"): ("high", "subprocess.call() — command execution"),
    ("subprocess", "Popen"): ("high", "subprocess.Popen() — command execution"),
    ("subprocess", "run"): ("medium", "subprocess.run() — command execution"),
    ("importlib", "import_module"): ("high", "Dynamic module import"),
    ("ctypes", "cdll"): ("critical", "ctypes — native code execution"),
    ("ctypes", "CDLL"): ("critical", "ctypes — native code execution"),
    ("pickle", "loads"): ("high", "pickle.loads() — deserialization attack vector"),
    ("pickle", "load"): ("high", "pickle.load() — deserialization attack vector"),
    ("marshal", "loads"): ("high", "marshal.loads() — code object deserialization"),
}

# Sensitive file paths that shouldn't be accessed
_SENSITIVE_PATHS = [
    r"/etc/passwd",
    r"/etc/shadow",
    r"~/.ssh",
    r"\.env",
    r"\.secret",
    r"\.aws/credentials",
    r"\.kube/config",
    r"id_rsa",
    r"\.git/config",
    r"\.netrc",
]
_SENSITIVE_PATH_RE = re.compile("|".join(_SENSITIVE_PATHS), re.IGNORECASE)

# Network exfiltration patterns in string literals
_EXFIL_PATTERNS = [
    (
        r"(?i)https?://(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[^\s\"']+",
        "medium",
        "External URL in string literal",
    ),
]

# Shell injection patterns in SKILL.md
_SHELL_PATTERNS = [
    (
        r"(?i)curl\s+[^\n]*\|\s*(sh|bash|zsh|python)",
        "critical",
        "curl piped to shell — remote code execution",
    ),
    (
        r"(?i)wget\s+[^\n]*\|\s*(sh|bash|zsh|python)",
        "critical",
        "wget piped to shell — remote code execution",
    ),
    (
        r"(?i)curl\s+[^\n]*>\s*/tmp/[^\s]+\s*&&\s*(sh|bash|chmod)",
        "high",
        "Download and execute pattern",
    ),
    (
        r"(?i)rm\s+-rf\s+/(?!\w)",
        "critical",
        "Destructive rm -rf / command",
    ),
    (
        r":\(\)\{[^\}]*:\|:&[^\}]*\};:",
        "critical",
        "Fork bomb",
    ),
    (
        r"(?i)mkfs\.|dd\s+if=.*of=/dev/",
        "critical",
        "Disk destruction command",
    ),
]


class _ASTScanner(ast.NodeVisitor):
    """AST visitor that collects security findings from Python code."""

    def __init__(self, filepath: str) -> None:
        self.filepath = filepath
        self.findings: list[Finding] = []
        self._source_lines: list[str] = []

    def scan(self, source: str) -> list[Finding]:
        self._source_lines = source.splitlines()
        try:
            tree = ast.parse(source, filename=self.filepath)
        except SyntaxError:
            # Can't parse — not necessarily dangerous, skip
            return []
        self.visit(tree)
        return self.findings

    def _snippet(self, lineno: int) -> str:
        if 0 < lineno <= len(self._source_lines):
            return self._source_lines[lineno - 1].strip()[:120]
        return ""

    def visit_Call(self, node: ast.Call) -> None:  # noqa: N802
        # Direct function calls: eval(), exec(), compile()
        if isinstance(node.func, ast.Name):
            name = node.func.id
            if name in _DANGEROUS_CALLS:
                severity = _DANGEROUS_CALLS[name]
                self.findings.append(
                    Finding(
                        severity=severity,
                        file=self.filepath,
                        line=node.lineno,
                        description=f"{name}() — dangerous built-in",
                        code_snippet=self._snippet(node.lineno),
                    )
                )

        # Attribute calls: os.system(), subprocess.Popen()
        if isinstance(node.func, ast.Attribute):
            attr_name = node.func.attr
            # Get module name from value
            if isinstance(node.func.value, ast.Name):
                module = node.func.value.id
                key = (module, attr_name)
                if key in _DANGEROUS_ATTRS:
                    severity, desc = _DANGEROUS_ATTRS[key]
                    self.findings.append(
                        Finding(
                            severity=severity,
                            file=self.filepath,
                            line=node.lineno,
                            description=desc,
                            code_snippet=self._snippet(node.lineno),
                        )
                    )

            # Check for open() on sensitive paths
            if attr_name == "open" or (
                isinstance(node.func, ast.Name) and node.func.id == "open"
            ):
                self._check_open_args(node)

        # Check open() as direct call too
        if isinstance(node.func, ast.Name) and node.func.id == "open":
            self._check_open_args(node)

        self.generic_visit(node)

    def _check_open_args(self, node: ast.Call) -> None:
        """Check if open() targets sensitive files."""
        for arg in node.args:
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                if _SENSITIVE_PATH_RE.search(arg.value):
                    self.findings.append(
                        Finding(
                            severity="high",
                            file=self.filepath,
                            line=node.lineno,
                            description=f"Access to sensitive path: {arg.value}",
                            code_snippet=self._snippet(node.lineno),
                        )
                    )

    def visit_Import(self, node: ast.Import) -> None:  # noqa: N802
        _CRITICAL_MODULES = {"ctypes"}
        for alias in node.names:
            if alias.name in ("ctypes", "pickle", "marshal"):
                severity = "critical" if alias.name in _CRITICAL_MODULES else "high"
                self.findings.append(
                    Finding(
                        severity=severity,
                        file=self.filepath,
                        line=node.lineno,
                        description=f"Import of dangerous module: {alias.name}",
                        code_snippet=self._snippet(node.lineno),
                    )
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:  # noqa: N802
        if node.module and node.module.split(".")[0] in ("ctypes", "pickle", "marshal"):
            self.findings.append(
                Finding(
                    severity="high",
                    file=self.filepath,
                    line=node.lineno,
                    description=f"Import from dangerous module: {node.module}",
                    code_snippet=self._snippet(node.lineno),
                )
            )
        self.generic_visit(node)

    def visit_Constant(self, node: ast.Constant) -> None:  # noqa: N802
        """Check string literals for sensitive paths and URLs."""
        if isinstance(node.value, str) and len(node.value) > 5:
            if _SENSITIVE_PATH_RE.search(node.value):
                self.findings.append(
                    Finding(
                        severity="medium",
                        file=self.filepath,
                        line=node.lineno,
                        description=f"Reference to sensitive path: {node.value[:80]}",
                        code_snippet=self._snippet(node.lineno),
                    )
                )
        self.generic_visit(node)


class SkillSecurityScanner:
    """Static analysis scanner for skill directories.

    Scans Python scripts via AST analysis and SKILL.md / shell scripts
    via regex patterns.
    """

    def scan_skill(
        self,
        skill_dir: Path | str,
        skill_name: Optional[str] = None,
    ) -> ScanResult:
        """Scan a skill directory for security issues.

        Args:
            skill_dir: Path to the skill directory.
            skill_name: Override skill name (default: directory name).

        Returns:
            ScanResult with findings.
        """
        skill_dir = Path(skill_dir)
        if not skill_name:
            skill_name = skill_dir.name

        findings: list[Finding] = []
        files_scanned = 0

        # Scan Python files in scripts/
        scripts_dir = skill_dir / "scripts"
        if scripts_dir.exists():
            for py_file in scripts_dir.rglob("*.py"):
                files_scanned += 1
                try:
                    source = py_file.read_text(encoding="utf-8", errors="replace")
                    rel_path = str(py_file.relative_to(skill_dir))
                    scanner = _ASTScanner(rel_path)
                    findings.extend(scanner.scan(source))
                    # Also scan string literals for URLs
                    findings.extend(
                        self._scan_strings_for_exfil(source, rel_path)
                    )
                except Exception as exc:
                    logger.warning("Failed to scan %s: %s", py_file, exc)

        # Scan shell scripts
        for sh_file in skill_dir.rglob("*.sh"):
            files_scanned += 1
            try:
                source = sh_file.read_text(encoding="utf-8", errors="replace")
                rel_path = str(sh_file.relative_to(skill_dir))
                findings.extend(self._scan_shell(source, rel_path))
            except Exception as exc:
                logger.warning("Failed to scan %s: %s", sh_file, exc)

        # Scan SKILL.md for shell commands
        skill_md = skill_dir / "SKILL.md"
        if skill_md.exists():
            files_scanned += 1
            try:
                source = skill_md.read_text(encoding="utf-8", errors="replace")
                findings.extend(self._scan_markdown(source, "SKILL.md"))
            except Exception as exc:
                logger.warning("Failed to scan SKILL.md: %s", exc)

        has_critical = any(f.severity == "critical" for f in findings)

        result = ScanResult(
            safe=not has_critical,
            skill_name=skill_name,
            findings=findings,
            files_scanned=files_scanned,
        )

        if findings:
            logger.warning(
                "Skill '%s' scan: %d finding(s) (%d critical)",
                skill_name,
                len(findings),
                result.critical_count,
            )

        return result

    def scan_content(
        self,
        content: str,
        skill_name: str,
        filename: str = "SKILL.md",
    ) -> ScanResult:
        """Scan raw SKILL.md content (before writing to disk).

        Useful for scanning during create_skill before files exist.
        """
        findings: list[Finding] = []
        findings.extend(self._scan_markdown(content, filename))

        has_critical = any(f.severity == "critical" for f in findings)
        return ScanResult(
            safe=not has_critical,
            skill_name=skill_name,
            findings=findings,
            files_scanned=1,
        )

    def scan_scripts_content(
        self,
        scripts: dict,
        skill_name: str,
        prefix: str = "scripts",
    ) -> ScanResult:
        """Scan scripts dict content before writing to disk.

        Args:
            scripts: Tree dict {filename: content} or nested.
            skill_name: Skill name for reporting.
            prefix: Path prefix for findings.
        """
        findings: list[Finding] = []
        files_scanned = 0

        def _walk(tree: dict, path: str) -> None:
            nonlocal files_scanned
            for key, value in tree.items():
                full_path = f"{path}/{key}"
                if isinstance(value, dict):
                    _walk(value, full_path)
                elif isinstance(value, str):
                    files_scanned += 1
                    if key.endswith(".py"):
                        scanner = _ASTScanner(full_path)
                        findings.extend(scanner.scan(value))
                        findings.extend(
                            self._scan_strings_for_exfil(value, full_path)
                        )
                    elif key.endswith(".sh"):
                        findings.extend(self._scan_shell(value, full_path))

        _walk(scripts, prefix)
        has_critical = any(f.severity == "critical" for f in findings)
        return ScanResult(
            safe=not has_critical,
            skill_name=skill_name,
            findings=findings,
            files_scanned=files_scanned,
        )

    def _scan_strings_for_exfil(
        self, source: str, filepath: str
    ) -> list[Finding]:
        """Scan source for potential data exfiltration URLs."""
        findings: list[Finding] = []
        for pattern, severity, desc in _EXFIL_PATTERNS:
            for m in re.finditer(pattern, source):
                url = m.group()
                # Skip common safe domains
                safe_domains = (
                    "github.com", "pypi.org", "npmjs.com",
                    "googleapis.com", "microsoft.com", "python.org",
                    "readthedocs.io", "example.com",
                )
                if any(d in url for d in safe_domains):
                    continue
                # Find line number
                line = source[:m.start()].count("\n") + 1
                findings.append(
                    Finding(
                        severity=severity,
                        file=filepath,
                        line=line,
                        description=f"{desc}: {url[:80]}",
                    )
                )
        return findings

    def _scan_shell(self, source: str, filepath: str) -> list[Finding]:
        """Scan shell script content for dangerous patterns."""
        findings: list[Finding] = []
        for pattern, severity, desc in _SHELL_PATTERNS:
            for m in re.finditer(pattern, source):
                line = source[:m.start()].count("\n") + 1
                findings.append(
                    Finding(
                        severity=severity,
                        file=filepath,
                        line=line,
                        description=desc,
                        code_snippet=m.group()[:120],
                    )
                )
        return findings

    def _scan_markdown(self, source: str, filepath: str) -> list[Finding]:
        """Scan markdown for shell injection patterns in code blocks."""
        findings: list[Finding] = []
        # Extract code blocks
        for block_match in re.finditer(
            r"```(?:sh|bash|shell|zsh)?\n(.*?)```",
            source,
            re.DOTALL,
        ):
            block = block_match.group(1)
            block_start = source[:block_match.start()].count("\n") + 1
            for pattern, severity, desc in _SHELL_PATTERNS:
                for m in re.finditer(pattern, block):
                    line = block_start + block[:m.start()].count("\n")
                    findings.append(
                        Finding(
                            severity=severity,
                            file=filepath,
                            line=line,
                            description=desc,
                            code_snippet=m.group()[:120],
                        )
                    )
        return findings
