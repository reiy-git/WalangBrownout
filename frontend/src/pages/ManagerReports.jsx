// Manager reports overview page showing transaction activity and summary stats
import React, { useState, useMemo, useEffect } from 'react';
import { getProductsList, getTransactionsList } from '../api';
import { enrichTransaction, formatCurrency, formatDateTime, formatNumber } from '../utils/format';
import { TableSkeleton } from '../components/common/Skeleton';

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
  const [activeTab, setActiveTab] = useState("This month");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load ledger records and enrich them with product information
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getProductsList(), getTransactionsList()])
      .then(([products, rawTxs]) => {
        if (active) setTransactions(rawTxs.map((tx) => enrichTransaction(tx, products)));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredTransactions = useMemo(
    () => transactions.filter((tx) => isInPeriod(tx.date, activeTab)),
    [transactions, activeTab]
  );

  const totalAmount = useMemo(
    () => filteredTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0),
    [filteredTransactions]
  );

  const totalReceivedQty = useMemo(
    () => filteredTransactions.filter(tx => tx.transaction_type === 'receive').reduce((acc, tx) => acc + (Number(tx.quantity) || 0), 0),
    [filteredTransactions]
  );

  const totalDispatchedQty = useMemo(
    () => filteredTransactions.filter(tx => tx.transaction_type === 'dispatch').reduce((acc, tx) => acc + (Number(tx.quantity) || 0), 0),
    [filteredTransactions]
  );

  const tabs = ["Today", "This month", "This year"];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Reports</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
        >
          📄 Print Report
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

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#d8b4fe]/50 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-[#4c1d95] uppercase">Total Value Movement</p>
          <p className="text-xl font-bold text-[#2e1065] mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white border border-[#d8b4fe]/50 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">Received Quantity</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{formatNumber(totalReceivedQty)} units</p>
        </div>
        <div className="bg-white border border-[#d8b4fe]/50 rounded-xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-rose-700 uppercase">Dispatched Quantity</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{formatNumber(totalDispatchedQty)} units</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
        {loading ? <TableSkeleton columns={6} rows={6} /> : <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-[#d8b4fe]/50">
          <table className="table table-sm w-full text-left">
            <thead>
              <tr className="text-[#2e1065] border-b border-[#d8b4fe]/50 bg-[#ede9fe]/50">
                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Handled By</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#4c1d95]">
              {filteredTransactions.map((tx, idx) => (
                <tr key={tx.id || idx} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/30">
                  <td>{formatDateTime(tx.timestamp || tx.date)}</td>
                  <td className={tx.type === "Received" ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                    {tx.typeLabel}
                  </td>
                  <td>{tx.productName}</td>
                  <td>{formatNumber(tx.quantity)}</td>
                  <td className="font-medium text-[#2e1065]">{formatCurrency(tx.amount)}</td>
                  <td>{tx.user}</td>
                </tr>
              ))}
              {!filteredTransactions.length && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#2e1065]/60">
                    No transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}
      </div>
    </main>
  );
}
