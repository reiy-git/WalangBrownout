const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

async function fetchDashboard(path) {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${baseUrl}/v1/dashboard/${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || response.statusText || "Dashboard request failed");
  }

  return data;
}

export function getDashboardData() {
  return Promise.all([
    fetchDashboard("summary"),
    fetchDashboard("panel1?limit=10"),
    fetchDashboard("panel2"),
  ]).then(([summary, panel1, panel2]) => ({
    summary,
    panel1: panel1.panel1 || [],
    reorderAlerts: panel2.reorder_alerts || [],
    expiryAlerts: panel2.expiry_alerts || [],
  }));
}
