import { getApiBase } from "@/lib/config";
import type { CustomerAiConfig, CustomerAiDone, CustomerAiMessage } from "../types";

function apiRoot() {
  return getApiBase().replace(/\/storefront\/public\/?$/, "").replace(/\/+$/, "");
}

const endpoint = (subdomain: string, path: string) => `${apiRoot()}/customer-ai/${encodeURIComponent(subdomain)}${path}`;

async function json<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "The shopping assistant is unavailable");
  return body as T;
}

export async function getCustomerAiConfig(subdomain: string) {
  return json<{ success: true; store: { name: string; logo: string | null }; config: CustomerAiConfig }>(await fetch(endpoint(subdomain, "/config"), { credentials: "include", cache: "no-store" }));
}

export async function getCustomerAiSession(subdomain: string, sessionId: string) {
  return json<{ success: true; session: { id: string; title: string | null; messages: CustomerAiMessage[] } }>(await fetch(endpoint(subdomain, `/sessions/${encodeURIComponent(sessionId)}`), { credentials: "include", cache: "no-store" }));
}

export async function deleteCustomerAiSession(subdomain: string, sessionId: string) {
  return json<{ success: true }>(await fetch(endpoint(subdomain, `/sessions/${encodeURIComponent(sessionId)}`), { method: "DELETE", credentials: "include" }));
}

export async function sendCustomerAiFeedback(subdomain: string, messageId: string, feedback: CustomerAiMessage["feedback"]) {
  return json<{ success: true }>(await fetch(endpoint(subdomain, `/messages/${encodeURIComponent(messageId)}/feedback`), { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedback }) }));
}

interface StreamHandlers {
  signal: AbortSignal;
  onMeta: (data: { sessionId: string; userMessage: CustomerAiMessage }) => void;
  onToken: (token: string) => void;
  onDone: (data: CustomerAiDone) => void;
}

export async function streamCustomerAi(subdomain: string, body: { message: string; sessionId?: string; pageContext?: { type: string; path: string } }, handlers: StreamHandlers) {
  const response = await fetch(endpoint(subdomain, "/chat/stream"), { method: "POST", credentials: "include", signal: handlers.signal, headers: { "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify(body) });
  if (!response.ok || !response.body) throw new Error((await response.json().catch(() => ({}))).message || "The shopping assistant is unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
      if (!block || block.startsWith(":")) continue;
      let event = "message"; const lines: string[] = [];
      for (const line of block.split("\n")) { if (line.startsWith("event:")) event = line.slice(6).trim(); else if (line.startsWith("data:")) lines.push(line.slice(5).trimStart()); }
      if (!lines.length) continue;
      const data = JSON.parse(lines.join("\n"));
      if (event === "meta") handlers.onMeta(data);
      else if (event === "token") handlers.onToken(data.token || "");
      else if (event === "done") handlers.onDone(data);
      else if (event === "error") throw new Error(data.message || "The shopping assistant is unavailable");
    }
  }
}
