import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, Home, ClipboardList, ShoppingCart, Users, FileText } from "lucide-react";
import Sidebar from "./Sidebar";
import { logout } from "../api/auth";

// Centralized navigation configuration for the sidebar
const MANAGER_MENU_ITEMS = [
  { key: "manager-dashboard", label: "Dashboard", icon: Home },
  { key: "inventory-list", label: "Inventory List", icon: ClipboardList },
  { key: "reorder-points", label: "Reorder Points", icon: ShoppingCart },
  { key: "users", label: "Users", icon: Users },
  { key: "reports", label: "Reports", icon: FileText }
];

const STAFF_MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "inventory-list", label: "Inventory List", icon: ClipboardList }
];

// Layout wrapper for both Manager and Staff dashboards
export default function DashboardLayout({ staffName = "Admin", avatarUrl = "", onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = (localStorage.getItem("user_role") || "").toLowerCase();
  const isStaff = userRole === "staff" || location.pathname === "/dashboard";
  const menuItems = isStaff ? STAFF_MENU_ITEMS : MANAGER_MENU_ITEMS;
  const displayName = localStorage.getItem("user_name") || (isStaff ? "Staff" : "Admin");

  // Trigger logout action
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      console.warn("Logout error:", e.message);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_name");
      if (onLogout) onLogout();
      navigate("/");
    }
  };

  // Derive the active sidebar key from the current path
  const getActiveKey = () => {
    const path = location.pathname.replace(/^\//, "");
    return path || (isStaff ? "dashboard" : "manager-dashboard");
  };

  // Map sidebar keys to actual route paths
  const handleSidebarNavigate = (key) => {
    navigate(`/${key}`);
    setSidebarOpen(false);
  };

  // Close the profile dropdown when clicking outside of it
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
    <div className="min-h-screen w-full bg-[#ede9fe]/30 font-sans flex overflow-hidden">
      <Sidebar
        items={menuItems}
        open={sidebarOpen}
        activeKey={getActiveKey()}
        onNavigate={handleSidebarNavigate}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top navbar */}
        <div className="navbar bg-[#e9d5ff] border-b border-[#ddd6fe] px-4 sm:px-6 shadow-xs flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="btn btn-ghost btn-square text-[#2e1065] hover:bg-[#c4b5fd]/30"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-sm text-[#2e1065] tracking-wide sm:hidden">IMS</span>
          </div>

          <div className="flex items-center gap-3" ref={menuRef}>
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring ring-[#c4b5fd] ring-offset-base-100 ring-offset-2 overflow-hidden bg-white flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span className="text-xs font-bold text-[#8b7fd6]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2e1065] hidden sm:inline">{displayName}</span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn btn-xs btn-outline border-[#c4b5fd] text-[#2e1065] hover:bg-[#ddd6fe] hover:border-[#c4b5fd] rounded-sm px-2 gap-1"
            >
              <LogOut size={12} />
              {loggingOut ? "..." : "Logout"}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
