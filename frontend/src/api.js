// Base API URL configuration
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

// Attach bearer token if authenticated
function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Generic fetch wrapper with JSON parsing and error handling
async function request(endpoint, options = {}) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) },
  });
  const text = await res.text();
  let data = {};
  if (text.trim()) {
    try { data = JSON.parse(text); } 
    catch { data = { message: text.replace(/<[^>]+>/g, "").trim() }; }
  }
  if (!res.ok) throw new Error(data.message || res.statusText || "Request failed");
  return data;
}

// Authenticate user with credentials
export async function login({ email, password }) {
  return await request("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

// Revoke current authentication token and clear local session
export async function logout() {
  try { await request("/logout", { method: "POST" }); } 
  finally { localStorage.removeItem("auth_token"); }
}

// Fetch currently logged-in user profile
export async function getCurrentUser() {
  return await request("/user");
}

// Calculate product stock status badge
export function computeStatus(stock, reorderPoint) {
  const s = Number(stock) || 0, r = Number(reorderPoint) || 0;
  return s <= 0 ? "Out Of Stock" : s <= r ? "Low Stock" : "In Stock";
}

// Fetch list of all inventory products
export async function getProductsList() {
  const res = await request("/products");
  return Array.isArray(res) ? res : res.data || [];
}

// Fetch single product by its ID
export async function getProductById(id) {
  return await request(`/products/${id}`);
}

// Create or update a product record
export async function saveProduct(p) {
  return p.id ? await request(`/products/${p.id}`, { method: "PUT", body: JSON.stringify(p) })
              : await request("/products", { method: "POST", body: JSON.stringify(p) });
}

// Delete product record by ID
export async function deleteProductById(id) {
  return await request(`/products/${id}`, { method: "DELETE" });
}

// Fetch list of registered users
export async function getUsersList() {
  const res = await request("/users");
  return Array.isArray(res) ? res : res.data || [];
}

// Fetch single user by ID
export async function getUserById(id) {
  return await request(`/users/${id}`);
}

// Create or update a user record
export async function saveUser(u) {
  return u.id ? await request(`/users/${u.id}`, { method: "PUT", body: JSON.stringify(u) })
              : await request("/users", { method: "POST", body: JSON.stringify(u) });
}

// Delete user account by ID
export async function deleteUserById(id) {
  return await request(`/users/${id}`, { method: "DELETE" });
}

// Fetch recent stock ledger transactions
export async function getTransactionsList(limit = 50) {
  const res = await request(`/transactions?limit=${limit}`);
  return Array.isArray(res) ? res : res.data || [];
}

// Record stock intake and create batch + ledger entry
export async function recordReceiveStock({ productId, quantity, supplier, notes, batchNumber }) {
  const res = await request("/transactions/receive", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: Number(quantity), supplier, notes, batch_number: batchNumber })
  });
  window.dispatchEvent(new Event("ims_transactions_updated"));
  return res;
}

// Record outgoing stock and decrement FIFO batches
export async function recordDispatchStock({ productId, quantity, department, notes }) {
  const res = await request("/transactions/dispatch", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: Number(quantity), department, notes })
  });
  window.dispatchEvent(new Event("ims_transactions_updated"));
  return res;
}

// Fetch dashboard metrics, feeds, and alerts
export async function getDashboardData() {
  const [summary, panel1, panel2] = await Promise.all([
    request("/v1/dashboard/summary"),
    request("/v1/dashboard/panel1?limit=10"),
    request("/v1/dashboard/panel2"),
  ]);
  return {
    summary,
    panel1: panel1.panel1 || [],
    reorderAlerts: panel2.reorder_alerts || [],
    expiryAlerts: panel2.expiry_alerts || [],
  };
}
