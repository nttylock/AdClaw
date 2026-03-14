import { useEffect, useState } from "react";
import type { Persona } from "../../api/types";
import { personaApi } from "../../api/modules/persona";

interface PersonaSelectorProps {
  selected: string | null;
  onSelect: (personaId: string | null) => void;
}

const PERSONA_COLORS: Record<string, string> = {
  coordinator: "#64748b",
  researcher: "#3b82f6",
  "content-writer": "#8b5cf6",
  "seo-specialist": "#06b6d4",
  "ads-manager": "#f59e0b",
  "social-media": "#ec4899",
};

function getColor(id: string): string {
  return PERSONA_COLORS[id] || "#64748b";
}

export default function PersonaSelector({
  selected,
  onSelect,
}: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    personaApi.listPersonas().then(setPersonas).catch(() => {});
  }, []);

  if (personas.length <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: "4px 0",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginRight: 2,
          userSelect: "none",
        }}
      >
        @
      </span>
      {personas.map((p) => {
        const isActive = selected === p.id;
        const color = getColor(p.id);
        return (
          <button
            key={p.id}
            onClick={() => onSelect(isActive ? null : p.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 10px",
              borderRadius: 9999,
              border: `1px solid ${isActive ? color : "rgba(226,232,240,0.6)"}`,
              background: isActive ? `${color}14` : "transparent",
              color: isActive ? color : "#64748b",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                opacity: isActive ? 1 : 0.4,
              }}
            />
            {p.name}
          </button>
        );
      })}
    </div>
  );
}
