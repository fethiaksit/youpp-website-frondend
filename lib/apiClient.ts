import { clearTokens, getAccessToken } from "./auth";

const missingBaseUrlMessage =
  "NEXT_PUBLIC_BACKEND_BASE_URL is not configured. Create a .env.local file with NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8080 and restart the dev server.";

function removeTrailingSlashes(value: string) {
  return value.replace(/\/+$/u, "");
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  if (!baseUrl) {
    throw new Error(missingBaseUrlMessage);
  }

  return removeTrailingSlashes(baseUrl);
}

async function handleUnauthorized() {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
