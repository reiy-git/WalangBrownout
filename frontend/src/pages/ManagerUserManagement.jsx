// Manager user management directory with search, filter, and pagination
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsersList, deleteUserById, saveUser } from '../api';
import { TableSkeleton } from '../components/common/Skeleton';

const PAGE_SIZE = 5;

export default function ManagerUserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formError, setFormError] = useState("");

  // Delete confirmation modal state
  const [userToDelete, setUserToDelete] = useState(null);

  // Load all user records on mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    getUsersList().then((items) => { if (active) setUsers(items); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const roleOptions = useMemo(
    () => ["All", ...new Set(users.map((u) => u.role).filter(Boolean))],
    [users]
  );
  const statusOptions = ["All", "Active", "Inactive"];

  const normalizedUsers = useMemo(() => {
    return users.map((u) => ({
      ...u,
      displayName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
      displayStatus: u.status || (u.active !== false && u.active !== 0 ? 'Active' : 'Inactive'),
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter((u) => {
      const fullName = u.displayName.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.trim().toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.displayStatus === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [normalizedUsers, searchTerm, roleFilter, statusFilter]);

  // Reset to first page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeFilterCount = (roleFilter !== "All" ? 1 : 0) + (statusFilter !== "All" ? 1 : 0);
  
  // Reset all active filter selections
  const clearFilters = () => { setRoleFilter("All"); setStatusFilter("All"); };

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Delete user from local state and backend database
  const handleConfirmDelete = async () => {
    await deleteUserById(userToDelete.id);
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const submitUser = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      ...(editingUser?.id ? { id: editingUser.id } : {}),
      name: data.get("name"), email: data.get("email"), role: data.get("role"),
      active: data.get("active") === "on",
    };
    if (data.get("password")) payload.password = data.get("password");
    if (!editingUser?.id && !payload.password) { setFormError("A password is required for a new user."); return; }
    try {
      setFormError("");
      await saveUser(payload);
      setUsers(await getUsersList());
      setEditingUser(null);
    } catch (err) { setFormError(err.message || "Unable to save this user."); }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">User Management</h1>
        <button
          onClick={() => { setFormError(""); setEditingUser({ role: "staff", active: true }); }}
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
            placeholder="Search User..."
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
        {loading ? <TableSkeleton columns={5} rows={5} /> : <div className="overflow-x-auto bg-[#ffffff] rounded-xl shadow-xs border border-[#d8b4fe]/50">
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
                    <td className="py-4 pl-6 text-[#2e1065]">
                      <div>{u.displayName}</div>
                      <div className="text-[11px] text-[#4c1d95]/70">{u.email}</div>
                    </td>
                    <td className="py-4 text-[#4c1d95]/80 capitalize">{u.role}</td>
                    <td className="py-4">
                      <span className={`font-semibold ${u.displayStatus === 'Active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {u.displayStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => { setFormError(""); setEditingUser(u); }}
                          className="btn btn-xs bg-[#c4b5fd] hover:bg-[#b4a5ed] border-0 text-xs px-2.5 rounded-md flex items-center justify-center text-[#2e1065] antialiased"
                        >
                          🖋︎ Edit
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
        </div>}

        {!loading && <div className="flex justify-end gap-1.5 mt-5">
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
        </div>}
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-[#d8b4fe]/50 animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-[#2e1065] mb-2">Confirm Delete User</h3>
            <p className="text-xs text-[#4c1d95]/80 mb-6">
              Are you sure you want to delete user <span className="font-bold text-[#2e1065]">{userToDelete.displayName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn btn-xs bg-gray-100 hover:bg-gray-200 text-[#2e1065] border-0 px-3.5 py-1.5 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-white border-0 px-3.5 py-1.5 rounded-lg font-semibold"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
          <form onSubmit={submitUser} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-[#2e1065]">{editingUser.id ? "Edit User" : "Add New User"}</h2>
            <div className="mt-4 grid gap-3">
              <label className="form-control"><span className="label-text text-xs">Full name</span><input name="name" className="input input-bordered input-sm" defaultValue={editingUser.name || editingUser.displayName || ""} required /></label>
              <label className="form-control"><span className="label-text text-xs">Email</span><input name="email" type="email" className="input input-bordered input-sm" defaultValue={editingUser.email || ""} required /></label>
              <label className="form-control"><span className="label-text text-xs">Role</span><select name="role" className="select select-bordered select-sm" defaultValue={editingUser.role || "staff"}><option value="staff">Staff</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label>
              <label className="form-control"><span className="label-text text-xs">{editingUser.id ? "New password (leave blank to keep current)" : "Password"}</span><input name="password" type="password" className="input input-bordered input-sm" minLength="6" /></label>
              <label className="label cursor-pointer justify-start gap-2"><input name="active" type="checkbox" className="checkbox checkbox-sm" defaultChecked={editingUser.active !== false && editingUser.active !== 0} /><span className="label-text">Active account</span></label>
            </div>
            <p className="mt-2 min-h-5 text-xs text-rose-600">{formError}</p>
            <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setEditingUser(null)} className="btn btn-sm btn-ghost">Cancel</button><button type="submit" className="btn btn-sm border-0 bg-[#8b7fd6] text-white">Save User</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
