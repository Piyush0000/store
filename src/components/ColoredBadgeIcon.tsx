"use client";

import { useEffect, useState } from "react";

/** A flat transparent icon can take one color. A photo or a multi-color logo cannot. */
function canRecolor(data: Uint8ClampedArray): boolean {
  let opaque = 0;
  let transparent = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 24) {
      transparent += 1;
      continue;
    }
    opaque += 1;
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
  }
  const total = opaque + transparent;
  if (!total || !opaque) return false;
  if (transparent / total < 0.12) return false;

  const meanR = sumR / opaque;
  const meanG = sumG / opaque;
  const meanB = sumB / opaque;
  let spread = 0;
  let counted = 0;
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 24) continue;
    const dr = data[i] - meanR;
    const dg = data[i + 1] - meanG;
    const db = data[i + 2] - meanB;
    spread += Math.sqrt(dr * dr + dg * dg + db * db);
    counted += 1;
  }
  return counted > 0 && spread / counted < 28;
}

export default function ColoredBadgeIcon({
  src,
  color,
  className,
}: {
  src: string;
  color: string;
  className?: string;
}) {
  const [tinted, setTinted] = useState("");

  useEffect(() => {
    let cancelled = false;
    setTinted("");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const edge = 128;
        const canvas = document.createElement("canvas");
        canvas.width = edge;
        canvas.height = edge;
        const ctx = canvas.getContext("2d");
        if (!ctx || !img.width || !img.height) return;
        const scale = Math.min(edge / img.width, edge / img.height);
        const width = Math.max(1, img.width * scale);
        const height = Math.max(1, img.height * scale);
        const x = (edge - width) / 2;
        const y = (edge - height) / 2;
        ctx.clearRect(0, 0, edge, edge);
        ctx.drawImage(img, x, y, width, height);
        const pixels = ctx.getImageData(Math.floor(x), Math.floor(y), Math.ceil(width), Math.ceil(height));
        if (!canRecolor(pixels.data)) return;
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, edge, edge);
        if (!cancelled) setTinted(canvas.toDataURL("image/png"));
      } catch {
        if (!cancelled) setTinted("");
      }
    };
    img.onerror = () => {
      if (!cancelled) setTinted("");
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, color]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={tinted || src} alt="" className={className} />
  );
}
