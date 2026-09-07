import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const USERS_KEY = "ims_users";

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const ROLE_OPTIONS = ["Administrator", "Manager", "Staff"];

export default function ManagerAddUser() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogout = () => navigate("/");
  const handleCancel = () => navigate("/users");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  const handleSave = () => {
    setErrorMsg("");

    if (!lastName.trim() || !firstName.trim() || !email.trim() || !role || !password || !confirmPassword) {
      setErrorMsg("⚠ Please fill in all required fields.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setErrorMsg("⚠ Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("⚠ Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("⚠ Password must be at least 6 characters.");
      return;
    }

    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg("⚠ A user with this email already exists.");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      email: email.trim(),
      role,
      status: "Active",
      employeeId: `IMS-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 90)}`,
      position: role,
      password,
    };

    saveUsers([...users, newUser]);
    navigate("/users");
  };

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
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30">
              <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5" stroke="#6b5ba8" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#2e1065]">Add New User</span>
          </div>

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

        <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col gap-5">

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
              <label className="block text-sm font-bold text-[#2e1065] mb-2">
                Last Name<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
              />
            </div>

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
              <label className="block text-sm font-bold text-[#2e1065] mb-2">
                First Name<span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
              />
            </div>

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
              <label className="block text-sm font-bold text-[#2e1065] mb-2">
                Email<span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
              />
            </div>

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
              <label className="block text-sm font-bold text-[#2e1065] mb-2">
                Role<span className="text-rose-500">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="select select-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
              >
                <option value="" disabled>Select role</option>
                {ROLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="bg-[#c4b5fd]/40 border border-[#8b7fd6]/40 rounded-xl p-3">
              <label className="block text-sm font-bold text-[#2e1065] mb-2">
                Password<span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 mb-2 focus:outline-none focus:border-[#8b7fd6]"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="input input-sm w-full bg-white border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/40 focus:outline-none focus:border-[#8b7fd6]"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button onClick={handleCancel} className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 border-0 text-white font-medium px-6 rounded-lg">
                Save User
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}