const missingBaseUrlMessage =
  "BACKEND_BASE_URL is not configured. Create a .env.local file with BACKEND_BASE_URL=http://localhost:8080 and restart the dev server.";

function removeTrailingSlashes(value: string) {
  return value.replace(/\/+$/u, "");
}

export function getBackendBaseUrl() {
  const baseUrl = process.env.BACKEND_BASE_URL;

  if (!baseUrl) {
    throw new Error(missingBaseUrlMessage);
  }

  return removeTrailingSlashes(baseUrl);
}
