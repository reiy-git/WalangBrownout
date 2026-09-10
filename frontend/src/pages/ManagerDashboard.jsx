import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/imsApi";
import { getTransactionsList } from "../services/dataService";
import { DUMMY_DASHBOARD_SUMMARY, USE_DUMMY_DATA } from "../data/dummyData";

const SUMMARY_FALLBACKS = [
  "Total Products",
  "Low Stock Items",
  "Reorder Alerts",
  "Total Active Users",
  "Today Reports",
];

export default function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(
    USE_DUMMY_DATA ? DUMMY_DASHBOARD_SUMMARY : null,
  );
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardData()
      .then(setDashboard)
      .catch((dashboardError) => {
        if (!USE_DUMMY_DATA) setError(dashboardError.message);
      });
  }, []);

  useEffect(() => {
    const refreshTransactions = () => {
      getTransactionsList().then(setTransactions);
    };

    refreshTransactions();
    window.addEventListener("storage", refreshTransactions);
    window.addEventListener("ims_transactions_updated", refreshTransactions);

    return () => {
      window.removeEventListener("storage", refreshTransactions);
      window.removeEventListener("ims_transactions_updated", refreshTransactions);
    };
  }, []);

  const summary = dashboard?.summary || dashboard || {};

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065] mb-6">Dashboard Summary</h1>
      {error && <div className="alert alert-error mb-6 text-sm" role="alert">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }, (_, index) => {
          const item = summary[`summary_item_${index + 1}`] || {};
          return (
            <div key={index} className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">{item.label || SUMMARY_FALLBACKS[index]}</span>
              <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">{item.value ?? 0}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <section className="lg:col-span-7 bg-[#ede9fe] border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-[#2e1065] mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
            <table className="table table-sm w-full text-left">
              <thead><tr className="text-[#2e1065] border-b border-[#d8b4fe]/50 bg-[#ede9fe]/50"><th>Date &amp; Time</th><th>Type</th><th>Product</th><th>Quantity</th></tr></thead>
              <tbody className="text-xs text-[#4c1d95]">
                {transactions.slice(0, 10).map((transaction, index) => {
                  const type = transaction.type === "Received" ? "Receive" : "Dispatch";
                  return <tr key={transaction.id || index} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/30"><td>{transaction.date || transaction.timestamp || "-"}</td><td className={type === "Receive" ? "text-emerald-600" : "text-rose-500"}>{type}</td><td>{transaction.productName || "Unknown Product"}</td><td>{transaction.quantity ?? 0}</td></tr>;
                })}
                {!transactions.length && <tr><td colSpan={4} className="py-8 text-center text-[#2e1065]/60">No transactions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-5 bg-[#ede9fe] border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <h2 className="text-sm sm:text-base font-bold text-[#2e1065] mb-2">Inventory Categories</h2>
          {[
            ["Category A", "Seasonal", "bg-purple-100 text-purple-700"],
            ["Category B", "Steady", "bg-blue-100 text-blue-700"],
            ["Category C", "FIFO / Expiry Sensitive", "bg-amber-100 text-amber-700"],
          ].map(([category, description, className]) => (
            <div key={category} className="bg-white rounded-xl p-3.5 border border-[#d8b4fe]/50 flex justify-between items-center shadow-xs">
              <span className="text-xs font-semibold text-[#2e1065]">{category}</span>
              <span className={`badge badge-sm font-bold border-0 ${className}`}>{description}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
