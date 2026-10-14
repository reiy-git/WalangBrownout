// Base API URL configuration
const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

//  plain object cache — GET results stored by endpoint key,
// mutations wipe matching keys so the next GET is fresh. No TTL until stale data is a real problem.
const _cache = {};

// Return cached data if we have it, otherwise fetch and store
async function cachedRequest(endpoint, options = {}) {
  if (_cache[endpoint]) return _cache[endpoint];
  const data = await request(endpoint, options);
  _cache[endpoint] = data;
  return data;
}

// Wipe all cache keys starting with prefix (e.g. "/products" clears "/products" and "/products/5")
function invalidate(prefix) {
  for (const key of Object.keys(_cache)) {
    if (key.startsWith(prefix)) delete _cache[key];
  }
}

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

// Fetch list of all inventory products (cached until a mutation clears it)
export async function getProductsList() {
  const res = await cachedRequest("/products");
  return Array.isArray(res) ? res : res.data || [];
}

// Fetch single product by its ID
export async function getProductById(id) {
  return await request(`/products/${id}`);
}

// Create or update a product record (clears product + dashboard caches)
export async function saveProduct(p) {
  const res = p.id ? await request(`/products/${p.id}`, { method: "PUT", body: JSON.stringify(p) })
              : await request("/products", { method: "POST", body: JSON.stringify(p) });
  invalidate("/products");
  invalidate("/v1/dashboard");
  return res;
}

// Delete product record by ID (clears product + dashboard caches)
export async function deleteProductById(id) {
  const res = await request(`/products/${id}`, { method: "DELETE" });
  invalidate("/products");
  invalidate("/v1/dashboard");
  return res;
}

// Fetch list of registered users (cached)
export async function getUsersList() {
  const res = await cachedRequest("/users");
  return Array.isArray(res) ? res : res.data || [];
}

// Fetch single user by ID
export async function getUserById(id) {
  return await request(`/users/${id}`);
}

// Create or update a user record (clears user + dashboard caches)
export async function saveUser(u) {
  const res = u.id ? await request(`/users/${u.id}`, { method: "PUT", body: JSON.stringify(u) })
              : await request("/users", { method: "POST", body: JSON.stringify(u) });
  invalidate("/users");
  invalidate("/v1/dashboard");
  return res;
}

// Delete user account by ID (clears user cache)
export async function deleteUserById(id) {
  const res = await request(`/users/${id}`, { method: "DELETE" });
  invalidate("/users");
  return res;
}

// Fetch recent stock ledger transactions (cached)
export async function getTransactionsList(limit = 50) {
  const res = await cachedRequest(`/transactions?limit=${limit}`);
  return Array.isArray(res) ? res : res.data || [];
}

// Record stock intake and create batch + ledger entry (clears product, transaction, dashboard caches)
export async function recordReceiveStock({ productId, quantity, supplier, notes, batchNumber }) {
  const res = await request("/transactions/receive", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: Number(quantity), supplier, notes, batch_number: batchNumber })
  });
  invalidate("/products");
  invalidate("/transactions");
  invalidate("/v1/dashboard");
  window.dispatchEvent(new Event("ims_transactions_updated"));
  return res;
}

// Record outgoing stock and decrement FIFO batches (clears product, transaction, dashboard caches)
export async function recordDispatchStock({ productId, quantity, department, notes }) {
  const res = await request("/transactions/dispatch", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: Number(quantity), department, notes })
  });
  invalidate("/products");
  invalidate("/transactions");
  invalidate("/v1/dashboard");
  window.dispatchEvent(new Event("ims_transactions_updated"));
  return res;
}

// Fetch dashboard metrics, feeds, and alerts (cached)
export async function getDashboardData() {
  const [summary, panel1, panel2] = await Promise.all([
    cachedRequest("/v1/dashboard/summary"),
    cachedRequest("/v1/dashboard/panel1?limit=10"),
    cachedRequest("/v1/dashboard/panel2"),
  ]);
  return {
    summary,
    panel1: panel1.panel1 || [],
    reorderAlerts: panel2.reorder_alerts || [],
    expiryAlerts: panel2.expiry_alerts || [],
  };
}
