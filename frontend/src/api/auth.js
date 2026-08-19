const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Perform auth login against the Laravel backend.
 * Safely parses JSON and preserves backend error messages.
 */
export async function login({ email, password }) {
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();
  let data = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.replace(/<[^>]+>/g, "").trim() };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || response.statusText || "Login failed");
  }

  return data;
}
