import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Steps,
  Card,
  message,
  Space,
  Typography,
  Select,
  Alert,
} from "antd";
import {
  Rocket,
  Key,
  MessageCircle,
  CheckCircle,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { request } from "../../api/request";
import styles from "./index.module.less";

const { Title, Text, Paragraph } = Typography;

interface CitedyStatus {
  configured: boolean;
  api_key_prefix?: string;
  balance?: { credits: number; status: string } | null;
  developer_url: string;
  billing_url: string;
}

interface ModelInfo {
  id: string;
  name: string;
}

interface ProviderInfo {
  id: string;
  name: string;
  models: ModelInfo[];
  current_api_key: string;
  current_base_url: string;
  is_local: boolean;
  needs_base_url: boolean;
}

interface ActiveModels {
  active_llm: { provider_id: string; model: string } | null;
}

// Recommended providers for the wizard (order matters)
const WIZARD_PROVIDERS = [
  "openrouter",
  "openai",
  "anthropic",
  "aliyun-intl",
  "aliyun-codingplan",
  "ollama",
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [citedyStatus, setCitedyStatus] = useState<CitedyStatus | null>(null);

  // LLM state
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [llmApiKey, setLlmApiKey] = useState("");
  const [savingLlm, setSavingLlm] = useState(false);
  const [llmConfigured, setLlmConfigured] = useState(false);

  useEffect(() => {
    request<CitedyStatus>("/citedy/status").then((res) => {
      setCitedyStatus(res);
      if (res.configured) setCurrentStep(1);
    });
    // Load providers
    request<ProviderInfo[]>("/models").then((res) => {
      setProviders(res);
    });
    // Check if LLM is already configured
    request<ActiveModels>("/models/active").then((res) => {
      if (res.active_llm?.provider_id) {
        setLlmConfigured(true);
        setSelectedProvider(res.active_llm.provider_id);
        setSelectedModel(res.active_llm.model);
      }
    });
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      message.warning("Please enter your Citedy API key");
      return;
    }
    setSaving(true);
    try {
      await request("/citedy/save-api-key", {
        method: "POST",
        body: JSON.stringify({ api_key: apiKey.trim() }),
        headers: { "Content-Type": "application/json" },
      });
      message.success("API key saved successfully!");
      setCurrentStep(1);
      const status = await request<CitedyStatus>("/citedy/status");
      setCitedyStatus(status);
    } catch {
      message.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const wizardProviders = providers.filter((p) =>
    WIZARD_PROVIDERS.includes(p.id)
  );
  const currentProvider = providers.find((p) => p.id === selectedProvider);

  const handleSaveLlm = async () => {
    if (!selectedProvider || !selectedModel) {
      message.warning("Please select a provider and model");
      return;
    }
    if (!currentProvider?.is_local && !llmApiKey.trim() && !currentProvider?.current_api_key) {
      message.warning("Please enter an API key for this provider");
      return;
    }
    setSavingLlm(true);
    try {
      // Save API key if provided
      if (llmApiKey.trim()) {
        await request(`/models/${selectedProvider}/config`, {
          method: "PUT",
          body: JSON.stringify({ api_key: llmApiKey.trim() }),
          headers: { "Content-Type": "application/json" },
        });
      }
      // Set active model
      await request("/models/active", {
        method: "PUT",
        body: JSON.stringify({
          provider_id: selectedProvider,
          model: selectedModel,
        }),
        headers: { "Content-Type": "application/json" },
      });
      message.success("LLM configured!");
      setLlmConfigured(true);
      setCurrentStep(2);
    } catch {
      message.error("Failed to configure LLM");
    } finally {
      setSavingLlm(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("adclaw_welcome_seen", "true");
    navigate("/chat", { replace: true });
  };

  const providerHints: Record<string, string> = {
    openrouter: "One key for all models — Claude, GPT, Gemini, Llama, etc. Get key at openrouter.ai",
    openai: "Direct access to GPT-5, o3, GPT-4o. Get key at platform.openai.com",
    anthropic: "Claude Opus, Sonnet, Haiku. Get key at console.anthropic.com",
    "aliyun-intl": "Qwen3.5, GLM-5, Kimi, MiniMax — international endpoint. Free trial available.",
    "aliyun-codingplan": "Same models as Aliyun Intl but China endpoint.",
    ollama: "Run models locally. No API key needed. Install at ollama.com",
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.heroSection}>
          <img
            src="/logo.png"
            alt="AdClaw"
            className={styles.logo}
          />
          <Title level={1} className={styles.title}>
            Welcome to AdClaw
          </Title>
          <Paragraph className={styles.subtitle}>
            Your AI Marketing Assistant powered by Citedy.
            <br />
            SEO articles, trend scouting, lead magnets, AI videos — all in one
            bot.
          </Paragraph>
        </div>

        <Steps
          current={currentStep}
          className={styles.steps}
          items={[
            { title: "Citedy API Key", icon: <Key size={18} /> },
            { title: "Choose LLM", icon: <Cpu size={18} /> },
            { title: "Connect & Start", icon: <CheckCircle size={18} /> },
          ]}
        />

        <div className={styles.stepContent}>
          {currentStep === 0 && (
            <Card className={styles.stepCard}>
              <Title level={4}>Step 1: Get your Citedy API Key</Title>
              <Paragraph>
                AdClaw uses Citedy for SEO tools, content generation, and
                marketing automation. You need a free API key to get started.
              </Paragraph>
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ExternalLink size={16} />}
                  onClick={() =>
                    window.open(
                      citedyStatus?.developer_url ||
                        "https://www.citedy.com/developer",
                      "_blank"
                    )
                  }
                >
                  Get Free API Key
                </Button>
                <Input.Password
                  size="large"
                  placeholder="Paste your citedy_agent_... key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onPressEnter={handleSaveApiKey}
                />
                <Button
                  type="primary"
                  size="large"
                  loading={saving}
                  onClick={handleSaveApiKey}
                  block
                >
                  Save API Key
                </Button>
                <Button type="link" onClick={() => setCurrentStep(1)}>
                  Skip for now
                </Button>
              </Space>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className={styles.stepCard}>
              <Title level={4}>Step 2: Choose your LLM Provider</Title>
              <Paragraph>
                AdClaw needs a language model to generate responses. Pick a
                provider and enter your API key.
              </Paragraph>

              {citedyStatus?.configured && (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircle size={16} />}
                  message={
                    <>
                      Citedy API key configured
                      {citedyStatus.balance && (
                        <Text type="secondary">
                          {" — "}{citedyStatus.balance.credits.toLocaleString()} credits
                        </Text>
                      )}
                    </>
                  }
                  style={{ marginBottom: 16 }}
                />
              )}

              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Select
                  size="large"
                  placeholder="Select LLM provider..."
                  style={{ width: "100%" }}
                  value={selectedProvider || undefined}
                  onChange={(val) => {
                    setSelectedProvider(val);
                    setSelectedModel("");
                    setLlmApiKey("");
                  }}
                  options={wizardProviders.map((p) => ({
                    value: p.id,
                    label: (
                      <span>
                        <strong>{p.name}</strong>
                        {p.id === "openrouter" && (
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            Recommended
                          </Text>
                        )}
                      </span>
                    ),
                  }))}
                />

                {selectedProvider && providerHints[selectedProvider] && (
                  <Alert
                    type="info"
                    message={providerHints[selectedProvider]}
                    style={{ fontSize: 13 }}
                  />
                )}

                {currentProvider && currentProvider.models.length > 0 && (
                  <Select
                    size="large"
                    placeholder="Select model..."
                    style={{ width: "100%" }}
                    value={selectedModel || undefined}
                    onChange={setSelectedModel}
                    options={currentProvider.models.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                  />
                )}

                {currentProvider && !currentProvider.is_local && (
                  <Input.Password
                    size="large"
                    placeholder={`Enter ${currentProvider.name} API key`}
                    value={llmApiKey}
                    onChange={(e) => setLlmApiKey(e.target.value)}
                  />
                )}

                <Space>
                  <Button
                    type="primary"
                    size="large"
                    loading={savingLlm}
                    onClick={handleSaveLlm}
                    disabled={!selectedProvider || !selectedModel}
                  >
                    Save & Continue
                  </Button>
                  <Button size="large" onClick={() => setCurrentStep(2)}>
                    Skip
                  </Button>
                  <Button
                    type="link"
                    onClick={() => navigate("/models")}
                  >
                    Advanced settings
                  </Button>
                </Space>
              </Space>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className={styles.stepCard}>
              <Title level={4}>Step 3: Connect & Start</Title>

              {llmConfigured && (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircle size={16} />}
                  message={`LLM configured: ${selectedModel || "ready"}`}
                  style={{ marginBottom: 16 }}
                />
              )}

              <Paragraph>
                Optionally connect a Telegram bot to chat with AdClaw from your
                phone — or jump straight to the web chat.
              </Paragraph>
              <Space size="middle">
                <Button
                  size="large"
                  icon={<MessageCircle size={16} />}
                  onClick={() => navigate("/channels")}
                >
                  Setup Telegram
                </Button>
                <Button type="primary" size="large" onClick={handleFinish}>
                  <Rocket size={16} style={{ marginRight: 8 }} />
                  Get Started!
                </Button>
              </Space>
            </Card>
          )}
        </div>

        {currentStep < 2 && (
          <div className={styles.skipSection}>
            <Button type="link" onClick={handleFinish}>
              Skip setup — go to chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
