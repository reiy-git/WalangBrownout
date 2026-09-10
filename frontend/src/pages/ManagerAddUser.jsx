import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUser, getUsersList } from '../services/dataService';

const ROLE_OPTIONS = ["Administrator", "Manager", "Staff"];

export default function ManagerAddUser() {
  const navigate = useNavigate();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => navigate("/users");

  // Validate input fields and save a new user
  const handleSave = async () => {
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

    setIsSubmitting(true);
    try {
      const users = await getUsersList();
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setErrorMsg("⚠ A user with this email already exists.");
        setIsSubmitting(false);
        return;
      }

      await saveUser({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        email: email.trim(),
        role,
        status: "Active",
        position: role,
        password,
      });

      navigate("/users");
    } catch (err) {
      setErrorMsg(err.message || "Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 mt-8 relative z-10 w-full pb-12 flex-1 flex flex-col font-sans">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#2e1065]">Add New User</h1>
      </div>

      <div className="bg-[#ede9fe]/40 border border-[#ddd6fe]/70 rounded-2xl p-5 sm:p-6 shadow-xs flex-1 flex flex-col gap-5 mt-4">
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
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-sm bg-[#c4b5fd]/60 hover:bg-[#c4b5fd]/90 border border-[#8b7fd6]/40 text-[#2e1065] font-semibold px-6 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="btn btn-sm bg-[#8b7fd6] hover:bg-[#8b7fd6]/90 border-0 text-white font-semibold px-8 rounded-lg shadow-sm text-xs"
          >
            {isSubmitting ? "Saving..." : "Save User"}
          </button>
        </div>
      </div>
    </main>
  );
}
