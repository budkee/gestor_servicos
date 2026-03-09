import { existsSync } from "node:fs";

const DEFAULT_LOCAL_API_URL = "http://localhost:8000";
const DOCKER_BACKEND_HOSTNAME = "backend";

function isRunningInsideDocker(): boolean {
  return existsSync("/.dockerenv");
}

function normalizeApiUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function remapBackendHostname(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== DOCKER_BACKEND_HOSTNAME || isRunningInsideDocker()) {
      return url;
    }

    parsed.hostname = "localhost";
    return parsed.toString();
  } catch {
    return url;
  }
}

export function resolveServerApiUrl(): string | null {
  const rawUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_LOCAL_API_URL;
  const trimmedUrl = rawUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  return normalizeApiUrl(remapBackendHostname(trimmedUrl));
}
