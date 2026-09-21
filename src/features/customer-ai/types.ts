export interface CustomerAiSource {
  tool: string;
  label: string;
  storeName: string;
  generatedAt: string;
  count: number;
  links: Array<{ label: string; href: string }>;
}

export interface CustomerAiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  feedback?: "POSITIVE" | "NEGATIVE" | null;
  sources?: CustomerAiSource[];
  streaming?: boolean;
}

export interface CustomerAiConfig {
  botName: string;
  welcomeMessage: string;
  primaryColor: string | null;
  supportedLanguages: string[];
}

export interface CustomerAiDone {
  sessionId: string;
  message: CustomerAiMessage;
  tools: Array<{ name: string; success: boolean }>;
  model: string;
}
