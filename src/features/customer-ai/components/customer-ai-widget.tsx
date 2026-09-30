"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bot, MessageCircle, Plus, RotateCcw, X } from "lucide-react";
import { getCustomerAiConfig } from "../api/customer-ai-api";
import { useCustomerChat } from "../hooks/use-customer-chat";
import type { CustomerAiConfig } from "../types";
import { CustomerAiComposer } from "./customer-ai-composer";
import { CustomerAiMessages } from "./customer-ai-messages";
import styles from "./customer-ai.module.css";

const suggestions = ["Help me find a product", "What offers are available?", "What is your return policy?"];

export default function CustomerAiWidget({ subdomain, storeName, brandColor }: { subdomain: string; storeName: string; brandColor?: string }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<CustomerAiConfig | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const chat = useCustomerChat(subdomain);
  useEffect(() => { if (subdomain) getCustomerAiConfig(subdomain).then((data) => setConfig(data.config)).catch(() => setConfig(null)); }, [subdomain]);
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: "end" }); }, [chat.messages, chat.loading, open]);
  if (!subdomain || !config) return null;
  const color = config.primaryColor || brandColor || "#2563eb";
  const theme = { "--customer-ai-color": color } as CSSProperties;
  return <div className={styles.root} style={theme}>
    {open && <section className={styles.panel} role="dialog" aria-modal="false" aria-label={`${config.botName} chat`}>
      <header className={styles.header}>
        <span className={styles.headerIcon}><Bot size={20} /></span>
        <div><strong>{config.botName}</strong><small>{storeName || "Store help"}</small></div>
        <button type="button" onClick={() => void chat.clear()} aria-label="Start a new conversation" title="New conversation"><Plus size={19} /></button>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={20} /></button>
      </header>
      <div className={styles.scrollArea}>
        <CustomerAiMessages messages={chat.messages} welcome={config.welcomeMessage} onFeedback={(id, value) => void chat.feedback(id, value).catch(() => {})} />
        {!chat.messages.length && <div className={styles.suggestions}>{suggestions.map((prompt) => <button type="button" key={prompt} onClick={() => void chat.send(prompt)}>{prompt}</button>)}</div>}
        {chat.error && <div className={styles.error} role="alert"><span>{chat.error}</span><button type="button" onClick={chat.retry}><RotateCcw size={14} /> Retry</button></div>}
        <div ref={bottom} />
      </div>
      <CustomerAiComposer loading={chat.loading} onSend={(message) => void chat.send(message)} onStop={chat.stop} />
      <p className={styles.disclaimer}>AI can make mistakes. Confirm important details with the store.</p>
    </section>}
    <button type="button" className={styles.launcher} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close shopping assistant" : "Open shopping assistant"}>{open ? <X size={24} /> : <MessageCircle size={25} />}</button>
  </div>;
}
