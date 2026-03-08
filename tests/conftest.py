# -*- coding: utf-8 -*-
"""Shared fixtures for AOM tests."""

import pytest

from adclaw.memory_agent.embeddings import FakeEmbeddingPipeline
from adclaw.memory_agent.models import AOMConfig
from adclaw.memory_agent.store import MemoryStore


@pytest.fixture
async def aom_store():
    """In-memory SQLite store — zero I/O."""
    store = MemoryStore(":memory:", dimensions=32)
    await store.initialize()
    yield store
    await store.close()


@pytest.fixture
def fake_embedder():
    """Deterministic embedding pipeline for tests."""
    return FakeEmbeddingPipeline(dimensions=32)


@pytest.fixture
def fake_llm_caller():
    """Canned LLM: extraction → JSON, consolidation → insight text."""

    async def caller(prompt: str) -> str:
        if "extract" in prompt.lower():
            return '{"entities": ["test_entity"], "topics": ["test_topic"], "importance": 0.7}'
        if "consolidat" in prompt.lower() or "synthesiz" in prompt.lower() or "cluster" in prompt.lower():
            return "INSIGHT: Test insight about the data.\nIMPORTANCE: 0.8"
        if "memory" in prompt.lower() or "question" in prompt.lower():
            return "Based on the memories, the answer is test. [Memory #abc123]"
        return "Test response"

    return caller


@pytest.fixture
def aom_config():
    """Default AOM configuration for tests."""
    return AOMConfig(
        enabled=True,
        embedding_backend="local",
        embedding_dimensions=32,
        importance_threshold=0.3,
    )
