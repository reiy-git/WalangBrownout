// Unified API client communicating strictly with the Laravel REST API endpoints
import { USE_DUMMY_DATA, INITIAL_TRANSACTIONS } from "../data/dummyData";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.replace(/<[^>]+>/g, "").trim() };
    }
  }

  if (!res.ok) {
    throw new Error(data.message || res.statusText || "Request failed");
  }

  return data;
}

// Product API
export const getProducts = () => request("/products");
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (productData) =>
  request("/products", { method: "POST", body: JSON.stringify(productData) });
export const updateProduct = (id, productData) =>
  request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: "DELETE" });

// Product Batch API
export const getProductBatches = () => request("/product-batches");
export const createProductBatch = (batchData) =>
  request("/product-batches", {
    method: "POST",
    body: JSON.stringify(batchData),
  });

// Stock movement / transactions API
export const getTransactions = (limit = 50) =>
  request(`/transactions?limit=${limit}`);
export const receiveStock = (data) =>
  request("/transactions/receive", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const dispatchStock = (data) =>
  request("/transactions/dispatch", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Dashboard API
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

// User Management API
export const getUsers = () => request("/users");
export const getUser = (id) => request(`/users/${id}`);
export const createUser = (userData) =>
  request("/users", { method: "POST", body: JSON.stringify(userData) });
export const updateUser = (id, userData) =>
  request(`/users/${id}`, { method: "PUT", body: JSON.stringify(userData) });
export const deleteUser = (id) => request(`/users/${id}`, { method: "DELETE" });

const TRANSACTIONS_KEY = "ims_transactions";
export function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) return JSON.parse(raw);
    return USE_DUMMY_DATA ? INITIAL_TRANSACTIONS : [];
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return USE_DUMMY_DATA ? INITIAL_TRANSACTIONS : [];
  }
}
