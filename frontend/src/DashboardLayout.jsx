import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, User, Settings } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ staffName = "Staff", avatarUrl = "", onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setLoggingOut(true);
    if (onLogout) onLogout();
  };

  const handleNavigate = (path) => {
    setProfileMenuOpen(false);
    navigate(path);
  };

  // Derive the active sidebar key from the current path
  const getActiveKey = () => {
    if (location.pathname === "/") return "dashboard";
    const firstSegment = location.pathname.split("/")[1];
    return firstSegment || "dashboard";
  };

  // Map sidebar keys to actual route paths
  const handleSidebarNavigate = (key) => {
    navigate(key === "dashboard" ? "/" : `/${key}`);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex">
      <Sidebar
        open={sidebarOpen}
        activeKey={getActiveKey()}
        onNavigate={handleSidebarNavigate}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top navbar */}
        <div className="navbar px-4 sm:px-6" style={{ backgroundColor: "#fce7f3" }}>
          <div className="flex-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="text-pink-900"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2"
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={staffName} className="w-full h-full object-cover" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.5 0 4.5-2 4.5-4.5S14.5 3 12 3 7.5 5 7.5 7.5 9.5 12 12 12z" stroke="#db2777" strokeWidth="1.5" />
                    <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-pink-900 hidden sm:inline">{staffName}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-sm btn-outline border-pink-300 text-pink-900 rounded-full gap-1 h-7 min-h-[28px] text-[11px]"
            >
              <LogOut size={12} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>

            {/* Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 sm:right-20 top-full mt-3 w-40 z-20">
                <div className="absolute -top-2 left-6 sm:left-auto sm:right-6 w-3 h-3 bg-violet-50 border-l border-t border-violet-200 rotate-45" />
                <div className="relative rounded-xl border border-violet-200 bg-violet-50 shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/profile")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-left hover:bg-violet-100 transition-colors ${
                      location.pathname === "/profile" ? "bg-violet-200 text-violet-950" : "text-violet-900"
                    }`}
                  >
                    <User size={14} />
                    View Profile
                  </button>
                  <div className="h-px bg-violet-200" />
                  <button
                    type="button"
                    onClick={() => handleNavigate("/settings")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-left hover:bg-violet-100 transition-colors ${
                      location.pathname === "/settings" ? "bg-violet-200 text-violet-950" : "text-violet-900"
                    }`}
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}