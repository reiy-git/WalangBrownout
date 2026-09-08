// Manager search interface for browsing and filtering transaction logs
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsList, getTransactionsList } from '../services/dataService';
import SearchInput from '../components/common/SearchInput';

// Enrich raw transactions with product metadata
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

export default function ManagerSearchReport() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);

  // Load transactions and products on mount
  useEffect(() => {
    Promise.all([getProductsList(), getTransactionsList()]).then(([products, rawTxs]) => {
      setTransactions(rawTxs.map((tx) => enrichTransaction(tx, products)));
    });
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return transactions;
    return transactions.filter((tx) =>
      tx.productName.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [transactions, searchTerm]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <button
        type="button"
        onClick={() => navigate("/reports")}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#2e1065] hover:text-[#6b5ba8] mb-4 w-fit"
      >
        ← Back to Reports
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Search Report</h1>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by product name..."
        />
      </div>

      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
        <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-md w-full text-left">
            <thead>
              <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                <th className="py-4 pl-6">Product</th>
                <th className="py-4">User</th>
                <th className="py-4">Transaction Type</th>
                <th className="py-4">Product ID</th>
                <th className="py-4">Date</th>
                <th className="py-4">Quantity</th>
                <th className="py-4 pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-[#2e1065]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                    <td className="py-4 pl-6">{tx.productName}</td>
                    <td className="py-4">{tx.user}</td>
                    <td className="py-4">
                      <span className={`font-semibold ${tx.typeLabel === "Receive" ? "text-emerald-600" : "text-rose-500"}`}>
                        {tx.typeLabel}
                      </span>
                    </td>
                    <td className="py-4 text-[#4c1d95]/80 font-mono">{tx.productId}</td>
                    <td className="py-4 text-[#4c1d95]/80">{tx.date}</td>
                    <td className="py-4 text-[#4c1d95]/90">{tx.quantity}</td>
                    <td className="py-4 pr-6 font-semibold">{formatCurrency(tx.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#2e1065]/60 text-sm font-medium">
                    No matching transactions found.
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

 