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
        match = re.match(r'^@([a-z0-9_-]+)\s+', text)
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
