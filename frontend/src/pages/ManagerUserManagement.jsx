import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

const USERS_KEY = "ims_users";
const PAGE_SIZE = 5;

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  const seedUsers = [
    { id: "u1", lastName: "Owfler", firstName: "Toni", email: "toniowfler67@gmail.com", role: "Administrator", status: "Inactive", employeeId: "IMS-240-66-12", position: "Administrator", password: "" },
    { id: "u2", lastName: "Briones", firstName: "Rely", email: "rely.briones@example.com", role: "Manager", status: "Active", employeeId: "IMS-240-66-13", position: "Manager", password: "" },
    { id: "u3", lastName: "Burgos", firstName: "Marriyell", email: "marriyell.burgos@example.com", role: "Staff", status: "Active", employeeId: "IMS-240-66-14", position: "Inventory Staff", password: "" },
    { id: "u4", lastName: "Canayong", firstName: "Ron", email: "ron.canayong@example.com", role: "Staff", status: "Active", employeeId: "IMS-240-66-15", position: "Inventory Staff", password: "" },
    { id: "u5", lastName: "Castillo", firstName: "Angelo", email: "angelo.castillo@example.com", role: "Staff", status: "Active", employeeId: "IMS-240-66-16", position: "Inventory Staff", password: "" },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
  return seedUsers;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export default function ManagerUserManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const roleOptions = useMemo(
    () => ["All", ...new Set(users.map((u) => u.role).filter(Boolean))],
    [users]
  );
  const statusOptions = ["All", "Active", "Inactive"];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.trim().toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount = (roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);
  const clearFilters = () => { setRoleFilter("All"); setStatusFilter("All"); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => navigate("/");

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/manager-dashboard" },
    { name: "Inventory List", icon: "📋", path: "/inventory-list" },
    { name: "Reorder Points", icon: "🛒", path: "/reorder-points" },
    { name: "Users", icon: "👥", path: "/users" },
    { name: "Reports", icon: "📄", path: "/reports" }
  ];

  const handleConfirmDelete = () => {
    const updated = users.filter((u) => u.id !== userToDelete.id);
    saveUsers(updated);
    setUsers(updated);
    setUserToDelete(null);
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">User Management</h1>
            <button
              onClick={() => navigate("/add-user")}
              className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium gap-1 px-3.5 rounded-lg shadow-sm text-xs"
            >
              ✦ Add New User
            </button>
          </div>

          <div className="flex gap-4 items-center mb-6 relative">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Product..."
                className="input input-sm w-full bg-[#c4b5fd]/30 border border-[#8b7fd6]/50 rounded-lg pl-3 pr-8 text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/60 focus:outline-none focus:border-[#8b7fd6]"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 hover:text-[#2e1065]"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 pointer-events-none">🔍</span>
              )}
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="btn btn-sm bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/60 border border-[#8b7fd6]/40 text-[#2e1065] gap-1 px-3.5 rounded-lg text-xs font-medium"
              >
                <span>⏳</span> Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8b7fd6] text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-[#d8b4fe]/60 rounded-xl shadow-lg p-4 z-40">
                  <div className="mb-3">
                    <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="select select-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                    >
                      {roleOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-[#2e1065] mb-1.5 uppercase tracking-wide">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select select-sm w-full bg-[#ede9fe]/50 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
                    >
                      {statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <button onClick={clearFilters} className="text-[11px] font-semibold text-[#8b7fd6] hover:text-[#6b5ba8]">
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="btn btn-xs bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-4 rounded-md"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
              <table className="table table-md w-full text-left">
                <thead>
                  <tr className="text-[#2e1065] text-sm font-bold border-b border-[#d8b4fe]/50 bg-[#ede9fe]/30">
                    <th className="py-4 pl-6">Full name</th>
                    <th className="py-4">Role</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-center">Edit/View</th>
                    <th className="py-4 text-center pr-6">Delete</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-[#2e1065]">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className="border-b border-[#d8b4fe]/30 hover:bg-[#ede9fe]/20 transition-colors">
                        <td className="py-4 pl-6 text-[#2e1065]">{u.firstName} {u.lastName}</td>
                        <td className="py-4 text-[#4c1d95]/80">{u.role}</td>
                        <td className="py-4">
                          <span className={`font-semibold ${u.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/edit-user/${u.id}`)}
                              className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased"
                            >
                              🖋︎
                            </button>
                            <button
                              onClick={() => navigate(`/view-user/${u.id}`)}
                              className="btn btn-square btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-sm flex items-center justify-center text-[#2e1065] antialiased"
                            >
                              👁︎
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-center pr-6">
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="btn btn-square btn-xs bg-rose-500 hover:bg-rose-600 border-0 text-sm flex items-center justify-center text-white antialiased mx-auto"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#2e1065]/60 text-sm font-medium">
                        No users match your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-1.5 mt-5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`btn btn-square btn-xs border-0 text-xs font-bold ${
                    currentPage === pageNum ? 'bg-[#c4b5fd] text-[#2e1065]' : 'bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 text-[#2e1065]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-square btn-xs bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/70 border border-[#8b7fd6]/30 text-xs text-[#2e1065] disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-rose-600 text-4xl mb-3">⚠</div>
            <h2 className="text-lg font-bold text-[#2e1065] mb-1">Delete this user?</h2>
            <p className="text-sm font-semibold text-[#2e1065] mb-1">
              {userToDelete.firstName} {userToDelete.lastName}
            </p>
            <p className="text-xs text-[#2e1065]/60 mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="btn btn-sm flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn btn-sm flex-1 bg-rose-600 hover:bg-rose-700 border-0 text-white font-medium rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}