import type { CustomerAiSource } from "../types";
import styles from "./customer-ai.module.css";

const safeHref = (href: string) => href.startsWith("/") && !href.startsWith("//") && !href.includes("\\");

export function CustomerAiSources({ sources }: { sources: CustomerAiSource[] }) {
  if (!sources.length) return null;
  return <div className={styles.sources} aria-label="Answer sources">
    <span>Sources:</span>
    {sources.flatMap((source) => source.links).filter((link) => safeHref(link.href)).slice(0, 5).map((link, index) => <a key={`${link.href}-${index}`} href={link.href}>{link.label}</a>)}
  </div>;
}
