const VIDEO_EXT =
  /\.(mp4|webm|mov|ogg|ogv|m4v|avi|mkv|3gp|mpeg|mpg)(\?|#|$)/i;

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes("/video/upload/")) return true;
  return VIDEO_EXT.test(trimmed);
}

export function videoMimeType(url: string): string {
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".ogg") || path.endsWith(".ogv")) return "video/ogg";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".m4v")) return "video/x-m4v";
  if (path.endsWith(".avi")) return "video/x-msvideo";
  if (path.endsWith(".mkv")) return "video/x-matroska";
  if (path.endsWith(".3gp")) return "video/3gpp";
  if (path.endsWith(".mpeg") || path.endsWith(".mpg")) return "video/mpeg";
  return "video/mp4";
}
