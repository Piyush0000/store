import { ArrowUpRight } from 'lucide-react';
import './PoweredByEvoc.css';

export function isLightColor(color: string): boolean {
  const hex = color.trim().replace(/^#/, '');
  const normalized = /^[0-9a-f]{3}$/i.test(hex)
    ? hex.split('').map(char => char + char).join('')
    : hex;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return false;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  return (red * 0.299 + green * 0.587 + blue * 0.114) > 150;
}

export default function PoweredByEvoc({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`powered-by-evoc${light ? ' powered-by-evoc--light' : ''}`}
      href="https://evoclabs.com"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Powered by EVOC Labs"
    >
      <span className="powered-by-evoc__label">Powered by</span>
      <span className="powered-by-evoc__brand" aria-hidden="true">
        <span className="powered-by-evoc__mark"><img src="/evoc-logo.png" alt="" /></span>
        <span className="powered-by-evoc__evoc">Evoc</span><span className="powered-by-evoc__labs">Labs</span>
      </span>
      <ArrowUpRight className="powered-by-evoc__arrow" size={13} aria-hidden="true" />
    </a>
  );
}
