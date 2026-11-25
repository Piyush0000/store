import { getBackendOrigin } from './config';

export function getMediaOrigin(): string {
  return getBackendOrigin();
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';

  if (process.env.NODE_ENV !== 'production' && trimmed.includes('api.evoclabs.com/uploads/')) {
    const uploadPath = trimmed.slice(trimmed.indexOf('/uploads/'));
    return `${getMediaOrigin()}${uploadPath}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    if (process.env.NODE_ENV === 'production' && (trimmed.includes('localhost:5000') || trimmed.includes('127.0.0.1:5000') || trimmed.includes('localhost:5001') || trimmed.includes('127.0.0.1:5001'))) {
      const uploadPath = trimmed.slice(trimmed.indexOf('/uploads/'));
      return `https://api.evoclabs.com${uploadPath}`;
    }
    return trimmed;
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
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
