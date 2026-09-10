// Central data service managing products, batches, transactions, and users
// Provides unified API calls with automatic dummyData fallback
import {
  USE_DUMMY_DATA,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_TRANSACTIONS,
} from "../data/dummyData";

import * as api from "../api/imsApi";

const STORAGE_KEYS = {
  PRODUCTS: "ims_products",
  USERS: "ims_users",
  TRANSACTIONS: "ims_transactions",
  BATCHES: "ims_batches",
};

// --- Helper Functions ---
function getLocal(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
  }
  return fallback;
}

function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Compute badge label based on stock count vs ROP
export function computeStatus(stock, reorderPoint) {
  const s = Number(stock) || 0;
  const r = Number(reorderPoint) || 0;
  if (s <= 0) return "Out Of Stock";
  if (s <= r) return "Low Stock";
  return "In Stock";
}

// --- Product Service ---
export async function getProductsList() {
  if (!USE_DUMMY_DATA) {
    try {
      const data = await api.getProducts();
      return Array.isArray(data) ? data : data.data || [];
    } catch (err) {
      console.warn("Backend API unavailable, falling back to local cache:", err.message);
    }
  }

  let products = getLocal(STORAGE_KEYS.PRODUCTS, null);
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS.map((p, idx) => ({
      id: p.id || `p${idx + 1}`,
      sku: p.sku || `SKU-${idx + 1}`,
      name: p.name,
      category: p.category || "Appliances",
      stock: Number(p.stock) || 0,
      reorderPoint: Number(p.reorderPoint) || 0,
      safetyStock: Number(p.safetyStock) || 5,
      leadTimeDemand: Number(p.leadTimeDemand) || 5,
      price: p.price || "0",
      description: p.description || "",
      image: p.image || null,
      status: p.status || computeStatus(p.stock, p.reorderPoint),
    }));
    setLocal(STORAGE_KEYS.PRODUCTS, products);
  }
  return products;
}

export async function getProductById(id) {
  const products = await getProductsList();
  return products.find((p) => String(p.id) === String(id)) || null;
}

export async function saveProduct(productData) {
  const products = await getProductsList();
  let updated;
  if (productData.id && products.some((p) => String(p.id) === String(productData.id))) {
    updated = products.map((p) =>
      String(p.id) === String(productData.id)
        ? {
            ...p,
            ...productData,
            status: computeStatus(productData.stock ?? p.stock, productData.reorderPoint ?? p.reorderPoint),
          }
        : p
    );
  } else {
    const newProduct = {
      ...productData,
      id: productData.id || `p_${Date.now()}`,
      status: computeStatus(productData.stock, productData.reorderPoint),
    };
    updated = [newProduct, ...products];
  }
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (!USE_DUMMY_DATA) {
    try {
      if (productData.id && products.some((p) => String(p.id) === String(productData.id))) {
        await api.updateProduct(productData.id, productData);
      } else {
        await api.createProduct(productData);
      }
    } catch (e) {
      console.warn("Backend save failed, stored locally:", e.message);
    }
  }
  return updated;
}

export async function deleteProductById(id) {
  const products = await getProductsList();
  const updated = products.filter((p) => String(p.id) !== String(id));
  setLocal(STORAGE_KEYS.PRODUCTS, updated);

  if (!USE_DUMMY_DATA) {
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn("Backend delete failed, updated locally:", e.message);
    }
  }
  return updated;
}

// --- User Service ---
export async function getUsersList() {
  if (!USE_DUMMY_DATA) {
    try {
      const data = await api.getUsers();
      return Array.isArray(data) ? data : data.data || [];
    } catch (err) {
      console.warn("Backend users API unavailable, falling back to local cache:", err.message);
    }
  }

  let users = getLocal(STORAGE_KEYS.USERS, null);
  if (!users || users.length === 0) {
    users = INITIAL_USERS;
    setLocal(STORAGE_KEYS.USERS, users);
  }
  return users;
}

export async function getUserById(id) {
  const users = await getUsersList();
  return users.find((u) => String(u.id) === String(id)) || null;
}

export async function saveUser(userData) {
  const users = await getUsersList();
  let updated;
  if (userData.id && users.some((u) => String(u.id) === String(userData.id))) {
    updated = users.map((u) => (String(u.id) === String(userData.id) ? { ...u, ...userData } : u));
  } else {
    const newUser = {
      ...userData,
      id: userData.id || `u_${Date.now()}`,
      status: userData.status || "Active",
      employeeId: userData.employeeId || `IMS-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 90)}`,
    };
    updated = [newUser, ...users];
  }
  setLocal(STORAGE_KEYS.USERS, updated);

  if (!USE_DUMMY_DATA) {
    try {
      if (userData.id && users.some((u) => String(u.id) === String(userData.id))) {
        await api.updateUser(userData.id, userData);
      } else {
        await api.createUser(userData);
      }
    } catch (e) {
      console.warn("Backend save user failed, updated locally:", e.message);
    }
  }
  return updated;
}

export async function deleteUserById(id) {
  const users = await getUsersList();
  const updated = users.filter((u) => String(u.id) !== String(id));
  setLocal(STORAGE_KEYS.USERS, updated);

  if (!USE_DUMMY_DATA) {
    try {
      await api.deleteUser(id);
    } catch (e) {
      console.warn("Backend delete user failed, updated locally:", e.message);
    }
  }
  return updated;
}

// --- Transaction / Ledger Service ---
export async function getTransactionsList(limit = 50) {
  if (!USE_DUMMY_DATA) {
    try {
      const data = await api.getTransactions(limit);
      return Array.isArray(data) ? data : data.data || [];
    } catch (err) {
      console.warn("Backend transactions API unavailable, falling back to local cache:", err.message);
    }
  }

  let txs = getLocal(STORAGE_KEYS.TRANSACTIONS, null);
  if (!txs || txs.length === 0) {
    txs = INITIAL_TRANSACTIONS;
    setLocal(STORAGE_KEYS.TRANSACTIONS, txs);
  }
  return txs;
}

export async function recordReceiveStock({ productId, quantity, supplier, notes, batchNumber }) {
  const qty = Number(quantity);
  const products = await getProductsList();
  const product = products.find((p) => String(p.id) === String(productId));
  if (!product) throw new Error("Product not found");

  // Update stock
  const newStock = (Number(product.stock) || 0) + qty;
  await saveProduct({ ...product, stock: newStock });

  // Record ledger entry
  const newTx = {
    id: `tx_${Date.now()}`,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    type: "Received",
    transaction_type: "receive",
    user: "Manager",
    supplier: supplier || "Supplier",
    notes: notes || "",
    batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
  };

  const existingTxs = await getTransactionsList();
  const updatedTxs = [newTx, ...existingTxs];
  setLocal(STORAGE_KEYS.TRANSACTIONS, updatedTxs);

  if (!USE_DUMMY_DATA) {
    try {
      await api.receiveStock({
        product_id: productId,
        quantity: qty,
        supplier,
        notes,
        batch_number: batchNumber,
      });
    } catch (e) {
      console.warn("Backend receive transaction failed, recorded locally:", e.message);
    }
  }

  window.dispatchEvent(new Event("ims_transactions_updated"));
  return { product: { ...product, stock: newStock }, transaction: newTx };
}

export async function recordDispatchStock({ productId, quantity, department, notes }) {
  const qty = Number(quantity);
  const products = await getProductsList();
  const product = products.find((p) => String(p.id) === String(productId));
  if (!product) throw new Error("Product not found");

  const currentStock = Number(product.stock) || 0;
  if (currentStock < qty) {
    throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${qty}`);
  }

  // FIFO stock decrement
  const newStock = currentStock - qty;
  await saveProduct({ ...product, stock: newStock });

  // Record ledger entry
  const newTx = {
    id: `tx_${Date.now()}`,
    productId: product.id,
    productName: product.name,
    quantity: qty,
    type: "Dispatched",
    transaction_type: "dispatch",
    user: "Manager",
    department: department || "Operations",
    notes: notes || "",
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
  };

  const existingTxs = await getTransactionsList();
  const updatedTxs = [newTx, ...existingTxs];
  setLocal(STORAGE_KEYS.TRANSACTIONS, updatedTxs);

  if (!USE_DUMMY_DATA) {
    try {
      await api.dispatchStock({
        product_id: productId,
        quantity: qty,
        department,
        notes,
      });
    } catch (e) {
      console.warn("Backend dispatch transaction failed, recorded locally:", e.message);
    }
  }

  window.dispatchEvent(new Event("ims_transactions_updated"));
  return { product: { ...product, stock: newStock }, transaction: newTx };
}
