import React from 'react';
import { useNavigate } from 'react-router';

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform any logout cleanup here if needed
    navigate("/");
  };

  // Mock Data for Recent Transactions
  const transactions = [
    { date: "07-29-2026", type: "Dispatch", id: "10-450-56", name: "Air Condition", qty: 67, amount: "$100,000.00" },
    { date: "07-29-2026", type: "Dispatch", id: "10-460-42", name: "Air Purifiers", qty: 50, amount: "$70,000.00" },
    { date: "07-29-2026", type: "Receive", id: "10-460-42", name: "Air Condition", qty: 100, amount: "$180,000.00" },
    { date: "07-29-2026", type: "Dispatch", id: "10-465-42", name: "Air Filters", qty: 30, amount: "$40,000.00" }
  ];

  return (
    <div className="min-h-screen bg-violet-50/50 font-sans pb-12">
      {/* Top Navbar */}
      <div className="navbar bg-purple-100 border-b border-purple-200 px-4 sm:px-6 shadow-xs flex justify-between items-center">
        <button className="btn btn-ghost btn-square text-violet-950">
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-8 h-8 rounded-full ring ring-violet-300 ring-offset-base-100 ring-offset-2">
              <img src="https://daisyui.com" alt="Profile" />
            </div>
          </div>
          <span className="text-xs font-semibold text-violet-950">Admin</span>
          <button onClick={handleLogout} className="btn btn-xs btn-outline border-violet-300 text-violet-950 hover:bg-violet-200 hover:border-violet-300 rounded-sm px-2">Logout</button>
        </div>
      </div>

      {/* Main Content Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <h1 className="text-xl sm:text-2xl font-bold text-violet-950 mb-6">Dashboard Summary</h1>

        {/* 5 Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-purple-200/70 border border-purple-300/50 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-violet-900 tracking-wide mb-1">Total Products</span>
            <div className="text-2xl font-bold text-violet-950 bg-purple-300/40 w-full py-1 rounded-lg mt-1">632</div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-purple-200/70 border border-purple-300/50 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-violet-900 tracking-wide mb-1">Low Stock Items</span>
            <div className="text-2xl font-bold text-violet-950 bg-purple-300/40 w-full py-1 rounded-lg mt-1">199</div>
          </div>

          {/* Reorders Alerts */}
          <div className="bg-purple-200/70 border border-purple-300/50 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-violet-900 tracking-wide mb-1">Reorders Alerts</span>
            <div className="text-2xl font-bold text-violet-950 bg-purple-300/40 w-full py-1 rounded-lg mt-1">39</div>
          </div>

          {/* Total Active User */}
          <div className="bg-purple-200/70 border border-purple-300/50 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold text-violet-900 tracking-wide mb-1">Total Active User</span>
            <div className="text-2xl font-bold text-violet-950 bg-purple-300/40 w-full py-1 rounded-lg mt-1">98</div>
          </div>

          {/* Today Reports */}
          <div className="bg-purple-200/70 border border-purple-300/50 shadow-xs rounded-xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-violet-900 tracking-wide mb-1">Today Reports</span>
            <div className="text-2xl font-bold text-violet-950 bg-purple-300/40 w-full py-1 rounded-lg mt-1">31</div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Transactions Table */}
          <div className="lg:col-span-7 bg-purple-200/40 border border-purple-300/40 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm sm:text-base font-bold text-violet-950 mb-4 px-1">Recent Transactions</h2>
            <div className="overflow-x-auto bg-white rounded-xl shadow-xs border border-violet-100">
              <table className="table table-sm w-full text-left">
                <thead>
                  <tr className="text-violet-950 border-b border-violet-100 bg-violet-50/50">
                    <th className="py-2.5 text-[11px] font-bold">Date & Time</th>
                    <th className="py-2.5 text-[11px] font-bold">Type</th>
                    <th className="py-2.5 text-[11px] font-bold">Product ID</th>
                    <th className="py-2.5 text-[11px] font-bold">Product Name</th>
                    <th className="py-2.5 text-[11px] font-bold text-center">Quantity</th>
                    <th className="py-2.5 text-[11px] font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-violet-900">
                  {transactions.map((t, index) => (
                    <tr key={index} className="border-b border-violet-50/60 hover:bg-violet-50/30">
                      <td className="py-3 font-medium">{t.date}</td>
                      <td className={`py-3 font-semibold ${t.type === 'Receive' ? 'text-emerald-600' : 'text-amber-600'}`}>{t.type}</td>
                      <td className="py-3 text-violet-800/80 font-mono">{t.id}</td>
                      <td className="py-3 font-medium">{t.name}</td>
                      <td className="py-3 text-center font-semibold">{t.qty}</td>
                      <td className="py-3 text-right font-semibold text-violet-950">{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Categories Chart Section */}
          <div className="lg:col-span-5 bg-purple-200/40 border border-purple-300/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">
            <h2 className="text-sm sm:text-base font-bold text-violet-950 mb-4">Top Categories</h2>
            
            <div className="bg-white rounded-xl p-6 flex flex-1 items-center justify-around border border-violet-100 shadow-xs gap-4">
              {/* Doughnut Chart Vector Graphic */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Category A Segment */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray="40 100" strokeDashoffset="0" />
                  {/* Category B Segment */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2563eb" strokeWidth="4.2" strokeDasharray="35 100" strokeDashoffset="-40" />
                  {/* Category C Segment */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#eab308" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-75" />
                  {/* Center cutout circle */}
                  <circle cx="18" cy="18" r="11.5" fill="#ffffff" />
                </svg>
              </div>

              {/* Category Labels */}
              <div className="flex flex-col gap-3 text-xs font-semibold text-violet-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span>Category A</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                  <span>Category B</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" />
                  <span>Category C</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}