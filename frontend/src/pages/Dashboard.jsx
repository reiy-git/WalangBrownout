import React, { useState, useEffect } from "react";
import { getDashboardData, getTransactionsList } from "../api";
import { formatCurrency, formatDateTime, formatNumber } from "../utils/format";

// Staff Dashboard - shows summary cards and recent activity
export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Fetch dashboard stats from backend on mount
  useEffect(() => {
    getDashboardData()
      .then(setDashboard)
      .catch((dashboardError) => setError(dashboardError.message));
  }, []);

  // Sync transactions across tabs and storage updates
  useEffect(() => {
    getTransactionsList().then(setTransactions);

    const handleTransactionUpdate = () => {
      getTransactionsList().then(setTransactions);
    };

    window.addEventListener("storage", handleTransactionUpdate);
    window.addEventListener("ims_transactions_updated", handleTransactionUpdate);

    return () => {
      window.removeEventListener("storage", handleTransactionUpdate);
      window.removeEventListener("ims_transactions_updated", handleTransactionUpdate);
    };
  }, []);

  const summary = dashboard?.summary || {};

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065] mb-6">
        Staff Dashboard Summary
      </h1>

      {error && (
        <div className="alert alert-error mb-6 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {([
          ["Total Products", summary.summary_item_1?.value ?? 0, false],
          ["Low Stock Items", summary.summary_item_2?.value ?? 0, false],
          ["Expiring Soon (Cat C)", summary.summary_item_3?.value ?? 0, false],
          ["Inventory Value", summary.summary_item_4?.value ?? 0, true],
        ]).map(([label, val, isMoney], idx) => (
          <div key={idx} className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
              {label}
            </span>
            <div className="text-xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1 px-1 truncate">
              {isMoney ? formatCurrency(val) : formatNumber(val)}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
        <h2 className="text-sm sm:text-base font-bold text-[#2e1065] mb-4">Recent Activity</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-sm w-full text-left">
            <thead>
              <tr className="text-[#2e1065] border-b border-[#d8b4fe]/50 bg-[#ede9fe]/50">
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#4c1d95]">
              {transactions.slice(0, 10).map((transaction, index) => {
                const type = transaction.type === "Received" ? "Receive" : "Dispatch";
                return (
                  <tr key={transaction.id || index} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/30">
                    <td>{formatDateTime(transaction.timestamp || transaction.date)}</td>
                    <td className={type === "Receive" ? "text-emerald-600" : "text-rose-500"}>{type}</td>
                    <td>{transaction.productName || "Unknown Product"}</td>
                    <td>{formatNumber(transaction.quantity)}</td>
                  </tr>
                );
              })}
              {!transactions.length && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#2e1065]/60">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}


