import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    if (onLogin) onLogin({ username, password });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 px-4 py-6">
      {/* Decorative Background Blobs */}
      <div className="hidden sm:block absolute w-36 h-36 rounded-full bg-purple-200/40 top-10 left-6 md:left-16" />
      <div className="hidden sm:block absolute w-40 h-40 rounded-full bg-purple-300/30 -top-16 right-10 md:right-32" />
      <div className="hidden sm:block absolute w-24 h-24 rounded-full bg-purple-200/40 bottom-16 left-1/5" />
      <div className="hidden sm:block absolute w-40 h-40 rounded-full bg-purple-300/30 -bottom-20 right-6 md:right-16" />

      {/* Scaled down card container using card-sm */}
      <div className="card card-sm relative z-10 w-full max-w-[280px] sm:max-w-[300px] bg-violet-50/90 shadow-md rounded-xl">
        <div className="card-body items-center text-center p-4 sm:p-5">
          {/* Shrunk logo container */}
          <div className="mb-1 w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#boxGradient)" stroke="#ffffff" strokeWidth="0.5" />
              <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#ffffff" fillOpacity="0.35" />
              <path d="M12 12V22" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
              <defs>
                <linearGradient id="boxGradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B7FD6" />
                  <stop offset="1" stopColor="#5B4FBF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-base font-medium text-violet-950">IMS</h1>
          <p className="text-[8px] font-medium tracking-widest text-violet-800/70 mb-2 text-center">
            INVENTORY MANAGEMENT SYSTEM
          </p>
          <p className="text-[11px] font-medium text-violet-900 mb-3">
            Please sign in your account
          </p>

          <form className="w-full flex flex-col gap-2.5 text-left" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="text-[11px] font-medium text-violet-900/80 mb-0.5 block" htmlFor="username">
                Username
              </label>
              {/* Shrunk using input-sm */}
              <div className="input input-sm w-full flex items-center gap-2 h-8 px-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z" stroke="#9a8cc2" strokeWidth="1.5" />
                  <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#9a8cc2" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  id="username"
                  type="text"
                  className="grow min-w-0 text-xs"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-violet-900/80 mb-0.5 block" htmlFor="password">
                Password
              </label>
              {/* Shrunk using input-sm */}
              <div className="input input-sm w-full flex items-center gap-2 h-8 px-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9a8cc2" strokeWidth="1.5" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9a8cc2" strokeWidth="1.5" />
                </svg>
                <input
                  id="password"
                  type="password"
                  className="grow min-w-0 text-xs"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-error text-[11px] text-center mt-0.5">{error}</p>}

            {/* Shrunk button using btn-sm */}
            <button type="submit" className="btn btn-primary btn-sm rounded-full w-full h-8 min-h-[32px] mt-1 text-xs">
              Login
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[8.5px] text-violet-800/60">©2026 Inventory Management System</p>
            <p className="text-[8.5px] text-violet-800/60">All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}