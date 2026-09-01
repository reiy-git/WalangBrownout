import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const USERS_KEY = "ims_users";

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export default function ManagerViewUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const users = loadUsers();
    const found = users.find((u) => String(u.id) === String(id));
    setUser(found || null);
  }, [id]);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ede9fe]/30">
        <p className="text-[#2e1065] font-medium">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#ede9fe]/30 font-sans relative overflow-hidden">

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-20 transition-opacity duration-300" />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 bg-[#8b7fd6] border-r border-[#ddd6fe] w-64 p-4 z-30 shadow-2xl flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#invBoxGrad)" stroke="#ffffff" strokeWidth="0.5" />
                <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#ffffff" fillOpacity="0.35" />
                <path d="M12 12V22" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
                <defs>
                  <linearGradient id="invBoxGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B7FD6" />
                    <stop offset="1" stopColor="#5B4FBF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-xl text-[#2e1065] tracking-wide">IMS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="btn btn-sm btn-ghost btn-circle text-[#2e1065]">✕</button>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`flex items-center gap-4 text-[#2e1065] font-medium py-2.5 px-4 rounded-xl text-left w-full transition-all duration-150 ${
                item.name === "Users" ? 'bg-[#c4b5fd] shadow-xs' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">

        <div className="navbar bg-[#e9d5ff] border-b border-[#ddd6fe] px-4 sm:px-6 shadow-xs flex justify-between items-center relative z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30">
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5" stroke="#6b5ba8" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring ring-[#c4b5fd] ring-offset-base-100 ring-offset-2">
                <img src="https://daisyui.com" alt="Profile" />
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2e1065]">Admin</span>
            <button onClick={handleLogout} className="btn btn-xs btn-outline border-[#c4b5fd] text-[#2e1065] hover:bg-[#ddd6fe] hover:border-[#c4b5fd] rounded-sm px-2">Logout</button>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065] mb-1">View User</h1>
          <p className="text-xs text-[#2e1065]/50 mb-6">User Management &gt; View User</p>

          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6">

            {/* Left profile card */}
            <div className="bg-[#c4b5fd]/50 border border-[#8b7fd6]/40 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
              <div className="w-24 h-24 rounded-full bg-white border border-[#d8b4fe]/60 overflow-hidden flex items-center justify-center">
                <span className="text-3xl text-[#8b7fd6]">👤</span>
              </div>
              <p className="text-sm font-bold text-[#2e1065] mt-2">{user.firstName} {user.lastName}</p>
              <span className="text-xs font-semibold text-[#2e1065]/70">{user.role}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                user.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {user.status}
              </span>

              <div className="w-full text-left mt-4 pt-4 border-t border-[#8b7fd6]/30 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">🪪</span>
                  <div>
                    <p className="text-[10px] font-bold text-[#2e1065]/60 uppercase">Employee ID</p>
                    <p className="text-xs font-semibold text-[#2e1065]">{user.employeeId}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">💼</span>
                  <div>
                    <p className="text-[10px] font-bold text-[#2e1065]/60 uppercase">Job Position</p>
                    <p className="text-xs font-semibold text-[#2e1065]">{user.position}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right detail card */}
            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-2xl p-5 sm:p-6">
              <h2 className="text-sm font-bold text-[#2e1065] mb-4">User Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#8b7fd6] text-white rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold opacity-80 mb-0.5">Last Name:</p>
                  <p className="text-sm font-bold">{user.lastName}</p>
                </div>
                <div className="bg-[#8b7fd6] text-white rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold opacity-80 mb-0.5">Employee ID:</p>
                  <p className="text-sm font-bold">{user.employeeId}</p>
                </div>
                <div className="bg-[#8b7fd6] text-white rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold opacity-80 mb-0.5">First Name:</p>
                  <p className="text-sm font-bold">{user.firstName}</p>
                </div>
                <div className="bg-[#8b7fd6] text-white rounded-lg px-4 py-2.5">
                  <p className="text-[10px] font-semibold opacity-80 mb-0.5">Position:</p>
                  <p className="text-sm font-bold">{user.position}</p>
                </div>
                <div className="bg-[#8b7fd6] text-white rounded-lg px-4 py-2.5 sm:col-span-2">
                  <p className="text-[10px] font-semibold opacity-80 mb-0.5">Email Address:</p>
                  <p className="text-sm font-bold">{user.email}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => navigate(`/edit-user/${user.id}`)}
                  className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-5 rounded-lg"
                >
                  🖋︎ Edit Profile
                </button>
                <button
                  onClick={() => navigate("/users")}
                  className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-5 rounded-lg"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}