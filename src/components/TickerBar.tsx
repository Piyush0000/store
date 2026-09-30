"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Star,
  Sparkles,
  Flame,
  Heart,
  Truck,
  Tag,
  Circle,
} from "lucide-react";
import {
  TICKER_PIXELS_PER_SECOND,
  resolveTickerBar,
  resolvedTextColor,
  type TickerBarConfig,
  type TickerMessage,
  type TickerSymbol,
} from "@/lib/ticker-bar-style";
import "./TickerBar.css";

const ICONS: Record<Exclude<TickerSymbol, "none">, React.ComponentType<{ size?: number }>> = {
  zap: Zap,
  star: Star,
  sparkles: Sparkles,
  flame: Flame,
  heart: Heart,
  truck: Truck,
  tag: Tag,
  dot: Circle,
};

interface TickerBarProps {
  config?: unknown;
}

/**
 * One continuously scrolling row. The message list is rendered twice so the
 * -50% translate loops without a seam, and the animation duration is derived
 * from the measured track width so `speed` means a constant px/second no matter
 * how much text the merchant entered.
 */
function TickerRow({
  config,
  messages,
  reverse,
  className,
  style,
  children,
}: {
  config: TickerBarConfig;
  messages: TickerMessage[];
  reverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: (message: TickerMessage, key: string) => React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30);
  const [repeat, setRepeat] = useState(1);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const row = track.parentElement;
    // scrollWidth covers both copies of the (already repeated) message list.
    const totalWidth = track.scrollWidth;
    if (totalWidth <= 0) return;

    const oneCopyWidth = totalWidth / (2 * repeat);
    if (oneCopyWidth <= 0) return;

    // The looping half must be wider than the row or a gap shows mid-loop.
    // Solved directly rather than incrementally — stepping one at a time hit the
    // ceiling before overflowing when a single message was very short.
    const rowWidth = row?.clientWidth ?? 0;
    const needed = Math.min(
      Math.max(Math.ceil((rowWidth + 80) / oneCopyWidth), 1),
      60,
    );
    if (needed !== repeat) {
      setRepeat(needed);
      return;
    }

    setDuration((oneCopyWidth * repeat) / TICKER_PIXELS_PER_SECOND[config.speed]);
  }, [config.speed, repeat]);

  // Changing the type or the messages changes the track width, so the duration
  // has to be recomputed — otherwise a layout keeps whatever duration the
  // previously rendered one measured.
  const signature = `${config.displayType}|${config.speed}|${messages
    .map((m) => m.text)
    .join("\u0000")}`;

  // Reset the repeat count when the content changes, otherwise a long list keeps
  // the padding a previous short list needed.
  useEffect(() => {
    setRepeat(1);
  }, [signature]);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    const track = trackRef.current;
    // The track itself is observed too: its width changes when the message list
    // does, which the parent row's width would not reflect.
    if (track) observer.observe(track);
    if (track?.parentElement) observer.observe(track.parentElement);
    return () => observer.disconnect();
  }, [measure, signature]);

  const filled: TickerMessage[] = [];
  for (let i = 0; i < repeat; i += 1) filled.push(...messages);

  const goingLeft = reverse ? config.direction === "right" : config.direction === "left";

  return (
    <div
      className={`ticker-bar__row ${config.pauseOnHover ? "ticker-bar__row--pausable" : ""} ${className || ""}`}
      style={style}
    >
      <div
        ref={trackRef}
        className="ticker-bar__track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: goingLeft ? "normal" : "reverse",
        }}
      >
        {[...filled, ...filled].map((message, i) => (
          <React.Fragment key={`${message.id}-${i}`}>
            {children(message, `${message.id}-${i}`)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function TickerBar({ config }: TickerBarProps) {
  const resolved = resolveTickerBar(config);

  if (!resolved.enabled || resolved.messages.length === 0) return null;

  const textColor = resolvedTextColor(resolved);
  const Icon = resolved.symbol === "none" ? null : ICONS[resolved.symbol];

  const symbol = (key: string) => {
    if (resolved.customSymbol) {
      return (
        <span className="ticker-bar__symbol" key={key} aria-hidden="true">
          {resolved.customSymbol}
        </span>
      );
    }
    if (!Icon) return <span className="ticker-bar__gap" key={key} aria-hidden="true" />;
    return (
      <span className="ticker-bar__symbol" key={key} aria-hidden="true">
        <Icon size={14} />
      </span>
    );
  };

  // A message plus its trailing separator. Linked messages stay keyboard
  // reachable; the duplicated copies are hidden from assistive tech by the row.
  const item = (message: TickerMessage, key: string) => (
    <>
      {message.link ? (
        <Link href={message.link} className="ticker-bar__item ticker-bar__item--link">
          {message.text}
        </Link>
      ) : (
        <span className="ticker-bar__item">{message.text}</span>
      )}
      {symbol(`${key}-sym`)}
    </>
  );

  const rootStyle: React.CSSProperties = {
    ["--ticker-bg" as string]: resolved.backgroundColor,
    ["--ticker-fg" as string]: textColor,
    ["--ticker-accent" as string]: resolved.accentColor,
  };

  const rootClass = [
    "ticker-bar",
    `ticker-bar--${resolved.displayType}`,
    `ticker-bar--h-${resolved.height}`,
    resolved.showEdges ? "ticker-bar--edges" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (resolved.displayType === "dual") {
    const half = Math.ceil(resolved.messages.length / 2);
    const rowA = resolved.messages.slice(0, half);
    const rowB =
      resolved.messages.length > 1 ? resolved.messages.slice(half) : resolved.messages;
    return (
      <section className={rootClass} style={rootStyle}>
        <TickerRow config={resolved} messages={rowA}>
          {item}
        </TickerRow>
        <TickerRow
          config={resolved}
          messages={rowB.length > 0 ? rowB : rowA}
          reverse
          className="ticker-bar__row--alt"
        >
          {item}
        </TickerRow>
      </section>
    );
  }

  if (resolved.displayType === "ribbon") {
    return (
      <section className={rootClass} style={rootStyle}>
        <div className="ticker-bar__ribbons">
          <TickerRow
            config={resolved}
            messages={resolved.messages}
            style={{ transform: `rotate(${resolved.tilt}deg)` }}
          >
            {item}
          </TickerRow>
          <TickerRow
            config={resolved}
            messages={resolved.messages}
            reverse
            className="ticker-bar__row--alt"
            style={{ transform: `rotate(${-resolved.tilt}deg)` }}
          >
            {item}
          </TickerRow>
        </div>
      </section>
    );
  }

  if (resolved.displayType === "pills") {
    const pill = (message: TickerMessage) => (
      <>
        {message.link ? (
          <Link href={message.link} className="ticker-bar__pill ticker-bar__pill--link">
            {Icon && <Icon size={13} />}
            {message.text}
          </Link>
        ) : (
          <span className="ticker-bar__pill">
            {Icon && <Icon size={13} />}
            {message.text}
          </span>
        )}
      </>
    );
    return (
      <section className={rootClass} style={rootStyle}>
        <TickerRow config={resolved} messages={resolved.messages}>
          {pill}
        </TickerRow>
      </section>
    );
  }

  if (resolved.displayType === "label") {
    return (
      <section className={rootClass} style={rootStyle}>
        {resolved.label && (
          <span className="ticker-bar__label">
            {Icon && <Icon size={14} />}
            {resolved.label}
          </span>
        )}
        <TickerRow config={resolved} messages={resolved.messages}>
          {item}
        </TickerRow>
      </section>
    );
  }

  // band + outline share the single-row markup and differ only in CSS.
  return (
    <section className={rootClass} style={rootStyle}>
      <TickerRow config={resolved} messages={resolved.messages}>
        {item}
      </TickerRow>
    </section>
  );
}
