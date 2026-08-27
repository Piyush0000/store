import { getBackendOrigin } from './config';

export function getMediaOrigin(): string {
  return getBackendOrigin();
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) return `${getMediaOrigin()}${trimmed}`;
  if (trimmed.startsWith('uploads/')) return `${getMediaOrigin()}/${trimmed}`;
  return trimmed;
}

export function resolveMediaTree<T>(value: T): T {
  if (typeof value === 'string') return resolveMediaUrl(value) as T;
  if (Array.isArray(value)) return value.map((item) => resolveMediaTree(item)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = resolveMediaTree(nested);
    }
    return out as T;
  }
  return value;
}
