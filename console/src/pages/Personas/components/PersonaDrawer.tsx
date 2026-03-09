import { useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Switch,
} from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import type { Persona } from "../../../api/types";

const { TextArea } = Input;

interface PersonaDrawerProps {
  open: boolean;
  editingPersona: Persona | null;
  onClose: () => void;
  onSubmit: (values: Partial<Persona>) => void;
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PersonaDrawer({
  open,
  editingPersona,
  onClose,
  onSubmit,
}: PersonaDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const isEditing = !!editingPersona;

  useEffect(() => {
    if (open) {
      if (editingPersona) {
        form.setFieldsValue({
          ...editingPersona,
          skills: editingPersona.skills || [],
          mcp_clients: editingPersona.mcp_clients || [],
          cron_enabled: editingPersona.cron?.enabled ?? false,
          cron_schedule: editingPersona.cron?.schedule ?? "",
          cron_prompt: editingPersona.cron?.prompt ?? "",
          cron_output: editingPersona.cron?.output ?? "chat",
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingPersona, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) {
      form.setFieldsValue({ id: nameToId(e.target.value) });
    }
  };

  const handleFinish = (values: Record<string, unknown>) => {
    const persona: Partial<Persona> = {
      id: values.id as string,
      name: values.name as string,
      soul_md: (values.soul_md as string) || "",
      model_provider: (values.model_provider as string) || "",
      model_name: (values.model_name as string) || "",
      skills: (values.skills as string[]) || [],
      mcp_clients: (values.mcp_clients as string[]) || [],
      is_coordinator: (values.is_coordinator as boolean) || false,
    };

    if (values.cron_enabled) {
      persona.cron = {
        enabled: true,
        schedule: (values.cron_schedule as string) || "",
        prompt: (values.cron_prompt as string) || "",
        output: (values.cron_output as "chat" | "file" | "both") || "chat",
      };
    } else {
      persona.cron = null;
    }

    onSubmit(persona);
  };

  return (
    <Drawer
      width={560}
      placement="right"
      title={isEditing ? `Edit: ${editingPersona.name}` : "Create Agent Persona"}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          is_coordinator: false,
          cron_enabled: false,
          cron_output: "chat",
          skills: [],
          mcp_clients: [],
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input
            placeholder="e.g., Growth Hacker"
            onChange={handleNameChange}
          />
        </Form.Item>

        <Form.Item
          name="id"
          label="ID"
          rules={[{ required: true, message: "Please enter an ID" }]}
        >
          <Input
            placeholder="e.g., growth-hacker"
            disabled={isEditing}
          />
        </Form.Item>

        <Form.Item name="soul_md" label="SOUL.md">
          <TextArea
            rows={8}
            placeholder="Define the persona's identity, role, and instructions..."
            style={{ fontFamily: "monospace", fontSize: 13 }}
          />
        </Form.Item>

        <Form.Item name="model_provider" label="Model Provider">
          <Input placeholder="Leave empty to use default" />
        </Form.Item>

        <Form.Item name="model_name" label="Model Name">
          <Input placeholder="Leave empty to use default" />
        </Form.Item>

        <Form.Item name="skills" label="Skills">
          <Select
            mode="tags"
            placeholder="Type skill names and press Enter"
            tokenSeparators={[","]}
          />
        </Form.Item>

        <Form.Item name="mcp_clients" label="MCP Clients">
          <Select
            mode="tags"
            placeholder="Type MCP client names and press Enter"
            tokenSeparators={[","]}
          />
        </Form.Item>

        <Form.Item
          name="is_coordinator"
          label="Coordinator"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <h4 style={{ margin: "0 0 12px" }}>Cron Schedule</h4>

          <Form.Item
            name="cron_enabled"
            label="Enable Cron"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.cron_enabled !== cur.cron_enabled}>
            {({ getFieldValue }) =>
              getFieldValue("cron_enabled") ? (
                <>
                  <Form.Item
                    name="cron_schedule"
                    label="Schedule (Cron Expression)"
                    rules={[{ required: true, message: "Schedule is required when cron is enabled" }]}
                  >
                    <Input placeholder="e.g., 0 9 * * *" />
                  </Form.Item>

                  <Form.Item name="cron_prompt" label="Prompt">
                    <TextArea
                      rows={3}
                      placeholder="What should this persona do on schedule?"
                    />
                  </Form.Item>

                  <Form.Item name="cron_output" label="Output">
                    <Select>
                      <Select.Option value="chat">Chat</Select.Option>
                      <Select.Option value="file">File</Select.Option>
                      <Select.Option value="both">Both</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>
        </div>

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? t("common.save") : t("common.create")}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
