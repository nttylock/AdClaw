import { Card, Button, Tag } from "@agentscope-ai/design";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { Persona } from "../../../api/types";
import styles from "../index.module.less";

interface PersonaCardProps {
  persona: Persona;
  isHover: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function PersonaCard({
  persona,
  isHover,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDelete,
}: PersonaCardProps) {
  const soulPreview = persona.soul_md
    ? persona.soul_md.split("\n").slice(0, 2).join("\n")
    : "";

  const modelLabel =
    persona.model_provider && persona.model_name
      ? `${persona.model_provider}/${persona.model_name}`
      : "Default";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${styles.personaCard} ${isHover ? styles.hover : styles.normal}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 className={styles.personaTitle}>{persona.name}</h3>
            {persona.is_coordinator && (
              <Tag color="purple">Coordinator</Tag>
            )}
          </div>
        </div>

        {soulPreview && (
          <div className={styles.soulPreview}>
            <code>{soulPreview}</code>
          </div>
        )}

        <div className={styles.badges}>
          <Tag color="blue">{modelLabel}</Tag>
          <Tag>{persona.skills.length} skills</Tag>
          <Tag>{persona.mcp_clients.length} MCP</Tag>
          {persona.cron && (
            <Tag color={persona.cron.enabled ? "green" : "default"}>
              {persona.cron.enabled ? "Cron: ON" : "Cron: OFF"}
            </Tag>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={styles.actionButton}
        >
          Edit
        </Button>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          className={styles.deleteButton}
          onClick={handleDeleteClick}
          aria-label={`Delete persona ${persona.name}`}
        />
      </div>
    </Card>
  );
}
