import React, { useState, useRef, useEffect } from "react";

export default function FilterDropdown({
  filters = [], // array of { label: string, value: string, options: string[], onChange: (val) => void }
  onClear,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCount = filters.reduce(
    (acc, f) => (f.value && f.value !== "All" ? acc + 1 : acc),
    0
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-sm bg-[#c4b5fd]/40 hover:bg-[#c4b5fd]/60 border border-[#8b7fd6]/40 text-[#2e1065] gap-1 px-3.5 rounded-lg text-xs font-medium"
      >
        <span>⏳</span> Filters
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8b7fd6] text-white text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-64 bg-white/95 backdrop-blur-sm border border-[#8b7fd6]/40 rounded-xl shadow-xl p-4 z-30 flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-[#8b7fd6]/20 pb-2">
            <span className="text-xs font-bold text-[#2e1065]">Filters</span>
            {activeCount > 0 && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-[11px] text-[#8b7fd6] hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {filters.map((filter, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[#2e1065]/80">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="select select-sm w-full bg-[#c4b5fd]/20 border border-[#8b7fd6]/40 rounded-lg text-xs font-medium text-[#2e1065] focus:outline-none focus:border-[#8b7fd6]"
              >
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
