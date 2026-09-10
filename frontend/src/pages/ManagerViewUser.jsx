// Manager read-only user profile overview page
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById } from '../services/dataService';

export default function ManagerViewUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load target user on mount
  useEffect(() => {
    getUserById(id).then((found) => {
      setUser(found);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <span className="loading loading-spinner text-[#8b7fd6]"></span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full flex-1 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-[#2e1065] font-medium mb-4">User not found.</p>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-6 rounded-lg text-xs"
          >
            ← Back to Users
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">View User</h1>
      </div>
      <p className="text-xs text-[#2e1065]/50 mb-6">User Management &gt; View User</p>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-6">
        {/* Left profile card */}
        <div className="bg-[#c4b5fd]/50 border border-[#8b7fd6]/40 rounded-2xl p-5 flex flex-col items-center text-center gap-2 shadow-xs">
          <div className="w-24 h-24 rounded-full bg-white border border-[#d8b4fe]/60 overflow-hidden flex items-center justify-center shadow-xs">
            <span className="text-3xl text-[#8b7fd6]">👤</span>
          </div>
          <h2 className="font-bold text-[#2e1065] text-base">{user.firstName} {user.lastName}</h2>
          <span className="text-xs text-[#2e1065]/70">{user.role}</span>
          <span className="badge badge-sm bg-emerald-100 text-emerald-700 font-semibold border-0 text-[10px] px-2.5 mt-1">
            {user.status || "Active"}
          </span>
        </div>

        {/* Right details card */}
        <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-[#8b7fd6]/20 pb-2">
              <span className="text-xs font-semibold text-[#2e1065]/60 block">Full Name</span>
              <span className="text-sm font-bold text-[#2e1065]">{user.firstName} {user.lastName}</span>
            </div>
            <div className="border-b border-[#8b7fd6]/20 pb-2">
              <span className="text-xs font-semibold text-[#2e1065]/60 block">Email Address</span>
              <span className="text-sm font-bold text-[#2e1065]">{user.email}</span>
            </div>
            <div className="border-b border-[#8b7fd6]/20 pb-2">
              <span className="text-xs font-semibold text-[#2e1065]/60 block">Assigned Role</span>
              <span className="text-sm font-bold text-[#2e1065]">{user.role}</span>
            </div>
            <div className="border-b border-[#8b7fd6]/20 pb-2">
              <span className="text-xs font-semibold text-[#2e1065]/60 block">Employee ID</span>
              <span className="text-sm font-mono text-[#2e1065]">{user.employeeId || "—"}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate(`/edit-user/${user.id}`)}
              className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-medium px-6 rounded-lg text-xs"
            >
              Edit User
            </button>
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="btn btn-sm bg-white hover:bg-gray-50 border border-gray-300 text-[#2e1065] font-medium px-6 rounded-lg text-xs"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
