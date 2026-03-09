import "server-only";
import { cookies } from "next/headers";

type FetcherOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function serverFetcher<T>(
  endpoint: string,
  options: FetcherOptions = {}
): Promise<T> {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("API_URL env var is not set");
  }

  const { skipAuth, headers, ...rest } = options;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: "no-store",
    ...rest,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro na requisicao");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
