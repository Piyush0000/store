"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deleteCustomerAiSession, getCustomerAiSession, sendCustomerAiFeedback, streamCustomerAi } from "../api/customer-ai-api";
import type { CustomerAiMessage } from "../types";

export function useCustomerChat(subdomain: string) {
  const [messages, setMessages] = useState<CustomerAiMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const storageKey = `evoc-customer-ai:${subdomain}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    getCustomerAiSession(subdomain, saved).then(({ session }) => { setSessionId(session.id); setMessages(session.messages); }).catch(() => localStorage.removeItem(storageKey));
  }, [storageKey, subdomain]);

  useEffect(() => () => controller.current?.abort(), []);

  const send = useCallback(async (raw: string) => {
    const message = raw.trim();
    if (!message || loading) return;
    setError(""); setLoading(true);
    controller.current = new AbortController();
    const streamedId = `stream-${Date.now()}`;
    try {
      await streamCustomerAi(subdomain, { message, sessionId, pageContext: { type: location.pathname.startsWith("/product/") ? "product" : location.pathname === "/checkout" ? "checkout" : "page", path: location.pathname } }, {
        signal: controller.current.signal,
        onMeta: (meta) => {
          setSessionId(meta.sessionId); localStorage.setItem(storageKey, meta.sessionId);
          setMessages((current) => [...current, meta.userMessage, { id: streamedId, role: "assistant", content: "", createdAt: new Date().toISOString(), streaming: true }]);
        },
        onToken: (token) => setMessages((current) => current.map((item) => item.id === streamedId ? { ...item, content: item.content + token } : item)),
        onDone: (done) => setMessages((current) => current.map((item) => item.id === streamedId ? done.message : item)),
      });
    } catch (cause) {
      if ((cause as Error).name !== "AbortError") setError(cause instanceof Error ? cause.message : "The shopping assistant is unavailable");
      setMessages((current) => current.filter((item) => item.id !== streamedId));
    } finally { setLoading(false); controller.current = null; }
  }, [loading, sessionId, storageKey, subdomain]);

  const stop = () => controller.current?.abort();
  const clear = async () => {
    controller.current?.abort();
    if (sessionId) await deleteCustomerAiSession(subdomain, sessionId).catch(() => {});
    localStorage.removeItem(storageKey); setSessionId(undefined); setMessages([]); setError("");
  };
  const feedback = async (messageId: string, value: CustomerAiMessage["feedback"]) => {
    await sendCustomerAiFeedback(subdomain, messageId, value);
    setMessages((current) => current.map((item) => item.id === messageId ? { ...item, feedback: value } : item));
  };
  const retry = () => { const last = [...messages].reverse().find((item) => item.role === "user"); if (last) void send(last.content); };
  return { messages, loading, error, send, stop, clear, feedback, retry };
}
