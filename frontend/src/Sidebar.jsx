import { Compass, Home, ClipboardList } from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "inventory", label: "Inventory List", icon: ClipboardList },
];

export default function Sidebar({ activeKey = "dashboard", onNavigate, open = true }) {
  const handleNavigate = (key) => {
    if (onNavigate) onNavigate(key);
  };

  return (
    <aside
      className={`shrink-0 bg-violet-500 text-white flex flex-col overflow-hidden
        transition-all duration-200 ease-in-out
        ${open ? "w-60" : "w-0"}`}
    >
      {/* Inner wrapper keeps a fixed width so content doesn't reflow/wrap while collapsing */}
      <div className="w-60 flex flex-col h-full">
        <div className="flex items-center gap-2 px-5 py-4">
          <div className="w-8 h-8 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
            <Compass size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">IMS</span>
        </div>

        <nav className="flex-1 px-3 py-2 flex flex-col gap-2">
          {navItems.map(({ key, label, icon: Icon }) => {
            const isActive = key === activeKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors whitespace-nowrap
                  ${isActive
                    ? "bg-violet-400 text-white font-medium shadow-sm"
                    : "text-violet-100 hover:bg-violet-400/60"
                  }`}
              >
                <span className="w-6 h-6 shrink-0 rounded-md bg-white/15 flex items-center justify-center">
                  <Icon size={14} />
                </span>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-[10px] text-violet-100/70 whitespace-nowrap">
          ©2026 Inventory Management System
        </div>
      </div>
    </aside>
  );
}