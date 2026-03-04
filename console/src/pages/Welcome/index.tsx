import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Steps, Card, message, Space, Typography } from "antd";
import {
  Rocket,
  Key,
  MessageCircle,
  CheckCircle,
  ExternalLink,
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

export default function WelcomePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [citedyStatus, setCitedyStatus] = useState<CitedyStatus | null>(null);

  useEffect(() => {
    request<CitedyStatus>("/citedy/status").then((res) => {
      setCitedyStatus(res);
      if (res.configured) setCurrentStep(1);
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
      setCurrentStep(2);
      // Refresh status
      const status = await request<CitedyStatus>("/citedy/status");
      setCitedyStatus(status);
    } catch {
      message.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("adclaw_welcome_seen", "true");
    navigate("/chat", { replace: true });
  };

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.heroSection}>
          <img
            src="/adclaw-symbol.svg"
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
            { title: "Get API Key", icon: <Key size={18} /> },
            { title: "Configure", icon: <Rocket size={18} /> },
            { title: "Start", icon: <CheckCircle size={18} /> },
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
              <Title level={4}>Step 2: Configure your LLM</Title>
              <Paragraph>
                AdClaw needs a language model to work. Go to Models settings to
                configure your preferred LLM provider (OpenAI, Ollama, Aliyun,
                etc.).
              </Paragraph>
              {citedyStatus?.configured && (
                <Paragraph>
                  <CheckCircle
                    size={16}
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                  Citedy API key is configured
                  {citedyStatus.balance && (
                    <Text type="secondary">
                      {" "}
                      — Balance: {citedyStatus.balance.credits} credits
                    </Text>
                  )}
                </Paragraph>
              )}
              <Space size="middle">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/models")}
                >
                  Configure Models
                </Button>
                <Button size="large" onClick={() => setCurrentStep(2)}>
                  Next
                </Button>
              </Space>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className={styles.stepCard}>
              <Title level={4}>Step 3: Connect Telegram (Optional)</Title>
              <Paragraph>
                Connect a Telegram bot to chat with AdClaw from your phone. Go
                to Channels settings and enter your Telegram bot token.
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
