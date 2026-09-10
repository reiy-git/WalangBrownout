import React from "react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative max-w-xs w-full ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input input-sm w-full bg-[#c4b5fd]/30 border border-[#8b7fd6]/50 rounded-lg pl-3 pr-8 text-xs font-medium text-[#2e1065] placeholder-[#2e1065]/60 focus:outline-none focus:border-[#8b7fd6]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 hover:text-[#2e1065]"
          aria-label="Clear search"
        >
          ✕
        </button>
      ) : (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#2e1065]/70 pointer-events-none">
          🔍
        </span>
      )}
    </div>
  );
}
