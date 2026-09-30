// Attach current product pricing and amount calculations to transaction items
export function enrichTransaction(tx, products = []) {
  const product = products.find(
    (p) => p.name === tx.productName || String(p.id) === String(tx.productId)
  );
  const price = product
    ? Number(product.unit_cost ?? product.price ?? 0)
    : 0;
  const amount = price * (Number(tx.quantity) || 0);
  return {
    ...tx,
    user: tx.user || "Admin",
    productId: tx.productId || product?.id || "N/A",
    amount,
    typeLabel: tx.type === "Received" || tx.transaction_type === "receive" ? "Receive" : "Dispatch",
  };
}

// Format numbers as currency in PHP
export function formatCurrency(amount) {
  return `₱${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format raw quantities/numbers with standard thousands commas
export function formatNumber(val) {
  return Number(val || 0).toLocaleString();
}

// Render backend ISO dates without exposing raw timestamps to users.
export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

// Use this for inventory ledger activity, where the movement time is useful.
export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
