import React from "react";

export default function Sidebar({ items = [], activeKey = "dashboard", onNavigate, open = true }) {
  const handleNavigate = (key) => {
    if (onNavigate) onNavigate(key);
  };

  return (
    <aside
      className={`shrink-0 bg-[#8b7fd6] border-r border-[#ddd6fe] text-white flex flex-col overflow-hidden transition-all duration-200 ease-in-out shadow-2xl z-30
        ${open ? "w-64" : "w-0"}`}
    >
      <div className="w-64 flex flex-col h-full p-4">
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="url(#sideBoxGrad)" stroke="#ffffff" strokeWidth="0.5" />
                <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#ffffff" fillOpacity="0.35" />
                <path d="M12 12V22" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" />
                <defs>
                  <linearGradient id="sideBoxGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B7FD6" />
                    <stop offset="1" stopColor="#5B4FBF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-bold text-xl text-[#2e1065] tracking-wide">IMS</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-3 flex-1">
          {items.map(({ key, label, icon: Icon }) => {
            const isActive = key === activeKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(key)}
                className={`flex items-center gap-3 text-[#2e1065] font-medium py-2.5 px-4 rounded-xl text-left w-full transition-all duration-150 ${
                  isActive
                    ? "bg-[#c4b5fd] shadow-xs font-semibold"
                    : "bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/80"
                }`}
              >
                <span className="text-lg shrink-0">
                  {typeof Icon === "string" ? Icon : Icon ? <Icon size={18} /> : null}
                </span>
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-2 py-3 text-[10px] text-[#2e1065]/70 whitespace-nowrap text-center">
          ©2026 Inventory Management System
        </div>
      </div>
    </aside>
  );
}
