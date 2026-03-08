# -*- coding: utf-8 -*-
"""ConsolidationEngine — finds patterns across memories and generates insights."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Callable, Coroutine, List, Optional

from .embeddings import EmbeddingPipeline
from .models import AOMConfig, Consolidation
from .store import MemoryStore

logger = logging.getLogger(__name__)

_CONSOLIDATE_PROMPT = """You are analyzing a cluster of related memory entries.
Generate a concise insight that synthesizes the key information from these memories.

Memories:
{memories}

Write a single concise insight paragraph (2-4 sentences) that captures the most important information, patterns, or connections across these memories. Rate its importance 0.0-1.0.

Format your response as:
INSIGHT: <your insight>
IMPORTANCE: <float>"""


class ConsolidationEngine:
    """Finds related memories, clusters them, and generates LLM insights."""

    def __init__(
        self,
        store: MemoryStore,
        embedder: EmbeddingPipeline,
        llm_caller: Callable[[str], Coroutine[Any, Any, str]],
        config: Optional[AOMConfig] = None,
    ) -> None:
        self.store = store
        self.embedder = embedder
        self.llm_caller = llm_caller
        self.config = config or AOMConfig()

    async def run_consolidation_cycle(self) -> List[Consolidation]:
        """Run one consolidation cycle: find clusters → generate insights."""
        memories = await self.store.get_unconsolidated_memories(limit=50)
        if len(memories) < 2:
            logger.debug("Consolidation: fewer than 2 unconsolidated memories, skipping")
            return []

        # Build clusters by finding neighbors for each memory
        clusters: List[List[str]] = []
        seen: set[str] = set()

        for mem in memories:
            if mem.id in seen:
                continue

            try:
                vec = await self.embedder.embed(mem.content)
                neighbors = await self.store.vector_search(vec, limit=5)
            except Exception:
                continue

            cluster_ids = [mem.id]
            for neighbor_id, dist in neighbors:
                if neighbor_id != mem.id and neighbor_id not in seen:
                    cluster_ids.append(neighbor_id)

            if len(cluster_ids) >= 2:
                clusters.append(cluster_ids)
                seen.update(cluster_ids)

        # Generate insights for each cluster
        results: List[Consolidation] = []
        for cluster_ids in clusters:
            try:
                insight = await self._generate_insight(cluster_ids)
                if insight:
                    results.append(insight)
                    await self.store.mark_consolidated(cluster_ids)
            except Exception as exc:
                logger.warning("Insight generation failed: %s", exc)

        logger.info("Consolidation: %d clusters → %d insights", len(clusters), len(results))
        return results

    async def _generate_insight(self, memory_ids: List[str]) -> Optional[Consolidation]:
        """Generate an insight from a cluster of memory IDs."""
        memories_text = []
        for mid in memory_ids:
            mem = await self.store.get_memory(mid)
            if mem:
                memories_text.append(f"- [{mem.source_type}/{mem.source_id}] {mem.content[:500]}")

        if not memories_text:
            return None

        prompt = _CONSOLIDATE_PROMPT.format(memories="\n".join(memories_text))
        raw = await self.llm_caller(prompt)

        # Parse response
        insight_text = raw.strip()
        importance = 0.5
        for line in raw.strip().split("\n"):
            if line.startswith("INSIGHT:"):
                insight_text = line[len("INSIGHT:"):].strip()
            elif line.startswith("IMPORTANCE:"):
                try:
                    importance = float(line[len("IMPORTANCE:"):].strip())
                except ValueError:
                    pass

        consolidation = Consolidation(
            insight=insight_text,
            memory_ids=memory_ids,
            importance=importance,
        )
        return await self.store.insert_consolidation(consolidation)


class ConsolidationScheduler:
    """Runs consolidation cycles on a schedule."""

    def __init__(
        self,
        engine: ConsolidationEngine,
        interval_minutes: int = 60,
    ) -> None:
        self.engine = engine
        self.interval_minutes = interval_minutes
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        self._task = asyncio.create_task(self._loop())
        logger.info("Consolidation scheduler started (every %d min)", self.interval_minutes)

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _loop(self) -> None:
        while True:
            await asyncio.sleep(self.interval_minutes * 60)
            try:
                await self.engine.run_consolidation_cycle()
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                logger.warning("Consolidation cycle error: %s", exc)
