// Manager reports overview page showing transaction activity and summaries
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsList, getTransactionsList } from '../services/dataService';

// Attach current product pricing and amount calculations to transaction items
function enrichTransaction(tx, products) {
  const product = products.find((p) => p.name === tx.productName || String(p.id) === String(tx.productId));
  const price = product && product.price ? Number(product.price) : 0;
  const amount = price * (Number(tx.quantity) || 0);
  return {
    ...tx,
    user: tx.user || "Admin",
    productId: tx.productId || product?.id || "N/A",
    amount,
    typeLabel: tx.type === "Received" ? "Receive" : "Dispatch",
  };
}

// Format numbers as currency in PHP
function formatCurrency(amount) {
  return `₱${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Filter transactions by predefined time intervals
function isInPeriod(dateStr, period) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;
  const now = new Date();

  if (period === "Today") {
    return d.toDateString() === now.toDateString();
  }
  if (period === "This month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (period === "This year") {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export default function ManagerReports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("This month");
  const [transactions, setTransactions] = useState([]);

  // Load ledger records and enrich them with product information
  useEffect(() => {
    Promise.all([getProductsList(), getTransactionsList()]).then(([products, rawTxs]) => {
      setTransactions(rawTxs.map((tx) => enrichTransaction(tx, products)));
    });
  }, []);

  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => isInPeriod(tx.date, activeTab)),
    [transactions, activeTab]
  );

  const tabs = ["Today", "This month", "This year"];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Reports</h1>
        <button
          type="button"
          onClick={() => navigate("/view-report")}
          className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
        >
          📄 Detailed Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm text-xs font-semibold px-4 rounded-lg transition-all ${
              activeTab === tab
                ? "bg-[#8b7fd6] text-white border-0 shadow-xs"
                : "bg-white/80 border border-[#8b7fd6]/30 text-[#2e1065] hover:bg-[#c4b5fd]/30"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>


  
       
        </main>
  );
}