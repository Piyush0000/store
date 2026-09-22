"use client";

import { useState } from "react";
import { Send, Square } from "lucide-react";
import styles from "./customer-ai.module.css";

export function CustomerAiComposer({ loading, onSend, onStop }: { loading: boolean; onSend: (message: string) => void; onStop: () => void }) {
  const [value, setValue] = useState("");
  const submit = () => { const message = value.trim(); if (!message || loading) return; setValue(""); onSend(message); };
  return <div className={styles.composer}>
    <textarea value={value} maxLength={2000} rows={1} aria-label="Message the shopping assistant" placeholder="Ask about a product or policy…" onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} />
    {loading ? <button type="button" onClick={onStop} aria-label="Stop generating"><Square size={17} fill="currentColor" /></button> : <button type="button" disabled={!value.trim()} onClick={submit} aria-label="Send message"><Send size={18} /></button>}
  </div>;
}
