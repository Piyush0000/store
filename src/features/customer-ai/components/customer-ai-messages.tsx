import { Bot, ThumbsDown, ThumbsUp, UserRound } from "lucide-react";
import type { CustomerAiMessage } from "../types";
import { CustomerAiSources } from "./customer-ai-sources";
import styles from "./customer-ai.module.css";

export function CustomerAiMessages({ messages, welcome, onFeedback }: { messages: CustomerAiMessage[]; welcome: string; onFeedback: (id: string, value: CustomerAiMessage["feedback"]) => void }) {
  if (!messages.length) return <div className={styles.empty}>
    <div className={styles.emptyIcon}><Bot size={24} /></div>
    <strong>{welcome}</strong>
    <p>Ask about products, offers, delivery, returns or store policies.</p>
  </div>;
  return <div className={styles.messageList} aria-live="polite">
    {messages.map((message) => <div key={message.id} className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : ""}`}>
      <span className={styles.avatar}>{message.role === "user" ? <UserRound size={15} /> : <Bot size={15} />}</span>
      <div className={styles.messageBody}>
        <div className={`${styles.bubble} ${message.role === "user" ? styles.userBubble : styles.assistantBubble}`}>{message.content || (message.streaming ? "Checking the store…" : "")}{message.streaming && message.content && <span className={styles.cursor} />}</div>
        {message.role === "assistant" && !message.streaming && <>
          <CustomerAiSources sources={message.sources || []} />
          <div className={styles.feedback} aria-label="Rate this answer">
            <button type="button" aria-label="Helpful answer" aria-pressed={message.feedback === "POSITIVE"} onClick={() => onFeedback(message.id, message.feedback === "POSITIVE" ? null : "POSITIVE")}><ThumbsUp size={14} /></button>
            <button type="button" aria-label="Not helpful" aria-pressed={message.feedback === "NEGATIVE"} onClick={() => onFeedback(message.id, message.feedback === "NEGATIVE" ? null : "NEGATIVE")}><ThumbsDown size={14} /></button>
          </div>
        </>}
      </div>
    </div>)}
  </div>;
}
