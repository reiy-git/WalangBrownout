// Base URL for API calls - uses env variable or defaults to /api
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

// Send login credentials strictly to the backend server and return token and user
export async function login({ email, password }) {
  const response = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
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

// Log out user on server
export async function logout() {
  const token = localStorage.getItem("auth_token");
  if (!token) return;

  try {
    await fetch(`${baseUrl}/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });
  } finally {
    localStorage.removeItem("auth_token");
  }
}

// Fetch currently authenticated user from server
export async function getCurrentUser() {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${baseUrl}/user`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    localStorage.removeItem("auth_token");
    throw new Error("Unauthorized");
  }

  return response.json();
}


