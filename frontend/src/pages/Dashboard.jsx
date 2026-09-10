import React, { useState, useEffect } from "react";
import { getDashboardData } from "../api/imsApi";
import { getTransactionsList } from "../services/dataService";
import { USE_DUMMY_DATA, DUMMY_DASHBOARD_SUMMARY } from "../data/dummyData";

// Staff Dashboard - shows summary cards and recent activity
export default function Dashboard() {
  const [dashboard, setDashboard] = useState(
    USE_DUMMY_DATA ? DUMMY_DASHBOARD_SUMMARY : null,
  );
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Fetch dashboard stats from backend on mount
  useEffect(() => {
    getDashboardData()
      .then(setDashboard)
      .catch((dashboardError) => {
        if (!USE_DUMMY_DATA) {
          setError(dashboardError.message);
        }
      });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
            {dashboard?.summary?.summary_item_1?.label || "Total Products"}
          </span>
          <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
            {dashboard?.summary?.summary_item_1?.value ?? 632}
          </div>
        </div>

        <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
            {dashboard?.summary?.summary_item_2?.label || "Low Stock Items"}
          </span>
          <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
            {dashboard?.summary?.summary_item_2?.value ?? 199}
          </div>
        </div>

        <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
            {dashboard?.summary?.summary_item_3?.label || "Reorders Alerts"}
          </span>
          <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
            {dashboard?.summary?.summary_item_3?.value ?? 39}
          </div>
        </div>

        <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
            {dashboard?.summary?.summary_item_4?.label || "Total Active User"}
          </span>
          <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
            {dashboard?.summary?.summary_item_4?.value ?? 98}
          </div>
        </div>

        <div className="bg-[#ede9fe] border border-[#ddd6fe]/70 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-[#4c1d95] tracking-wide mb-1">
            {dashboard?.summary?.summary_item_5?.label || "Today Reports"}
          </span>
          <div className="text-2xl font-bold text-[#2e1065] bg-[#d8b4fe]/80 w-full py-1 rounded-lg mt-1">
            {dashboard?.summary?.summary_item_5?.value ?? 31}
          </div>
        </div>
      </div>

      {/* PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* PANEL 1 - RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 shadow-xs flex flex-col">
          <h2 className="font-bold text-[#2e1065] text-base mb-4">
            Recent Activities
          </h2>
          <div className="overflow-x-auto flex-1">
            <table className="table table-sm w-full text-left bg-white rounded-xl shadow-xs">
              <thead>
                <tr className="text-[#2e1065] text-xs font-bold border-b border-[#ddd6fe]/50 bg-[#ede9fe]/50">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-[#2e1065]">
                {transactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-[#ede9fe]/20">
                    <td className="py-2.5 px-4 font-semibold">{tx.productName}</td>
                    <td className="py-2.5 px-4">
                      <span className={`badge badge-xs px-2 py-0.5 font-bold border-0 ${
                        tx.type === "Received" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">{tx.quantity}</td>
                    <td className="py-2.5 px-4 text-[#2e1065]/70">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PANEL 2 - SUMMARY BREAKDOWN */}
        <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-[#2e1065] text-base mb-4">
              Inventory Overview
            </h2>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3.5 border border-[#ddd6fe]/50 flex justify-between items-center shadow-xs">
                <span className="text-xs font-semibold text-[#2e1065]">Category A (Seasonal)</span>
                <span className="badge badge-sm bg-purple-100 text-purple-700 font-bold border-0">High Priority</span>
              </div>
              <div className="bg-white rounded-xl p-3.5 border border-[#ddd6fe]/50 flex justify-between items-center shadow-xs">
                <span className="text-xs font-semibold text-[#2e1065]">Category B (Steady)</span>
                <span className="badge badge-sm bg-blue-100 text-blue-700 font-bold border-0">Medium Priority</span>
              </div>
              <div className="bg-white rounded-xl p-3.5 border border-[#ddd6fe]/50 flex justify-between items-center shadow-xs">
                <span className="text-xs font-semibold text-[#2e1065]">Category C (FIFO)</span>
                <span className="badge badge-sm bg-amber-100 text-amber-700 font-bold border-0">Expiry Sensitive</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/70 border border-[#ddd6fe]/50 rounded-xl text-center mt-4">
            <p className="text-[11px] text-[#2e1065]/70 font-medium">Logged in as Staff User</p>
          </div>
        </div>
      </div>
    </main>
  );
}


