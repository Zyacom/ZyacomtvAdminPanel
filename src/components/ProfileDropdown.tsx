import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import { RootState } from "../redux/store";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user from Redux store
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  // Try to get user from localStorage if not in Redux
  const storedUser =
    localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
  const userFromStorage = storedUser ? JSON.parse(storedUser) : null;

  const currentUser = reduxUser || userFromStorage;

  const user = {
    name: currentUser
      ? `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        currentUser.username ||
        "Admin User"
      : "Admin User",
    role: currentUser?.role === "admin" ? "Administrator" : "Admin",
    email: currentUser?.email || "admin@ztv.com",
    image: currentUser?.image || null,
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      icon: <User size={18} />,
      label: "My Profile",
      action: () => {
        navigate("/settings");
        setIsOpen(false);
      },
    },
    {
      icon: <Settings size={18} />,
      label: "Settings",
      action: () => {
        navigate("/settings");
        setIsOpen(false);
      },
    },
    {
      icon: <Bell size={18} />,
      label: "Notifications",
      action: () => {
        navigate("/notifications");
        setIsOpen(false);
      },
    },
    {
      icon: <Shield size={18} />,
      label: "Privacy & Security",
      action: () => {
        navigate("/settings");
        setIsOpen(false);
      },
    },
    {
      icon: <HelpCircle size={18} />,
      label: "Help & Support",
      action: () => {
        navigate("/support");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 cursor-pointer group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative w-11 h-11 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} className="text-white" strokeWidth={2.5} />
            )}
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 font-semibold">{user.role}</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[70] animate-fadeIn">
          {/* User Info */}
          <div className="px-6 py-5 bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-500">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-white" strokeWidth={2.5} />
                )}
              </div>
              <div>
                <p className="text-base font-black text-white">{user.name}</p>
                <p className="text-xs text-white/80 font-semibold mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full px-6 py-3 flex items-center gap-3 text-gray-700 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-gray-500 group-hover:text-purple-600 transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold group-hover:text-gray-900">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
            >
              <LogOut size={18} strokeWidth={2.5} />
              <span className="text-sm font-bold">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
