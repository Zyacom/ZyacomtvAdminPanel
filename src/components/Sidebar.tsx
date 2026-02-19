import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Video,
  Tv,
  BarChart3,
  Settings,
  Shield,
  Headphones,
  ListVideo,
  Tag,
  CreditCard,
  Key,
  FileText,
  MessageSquare,
  DollarSign,
  Bell,
  UserCog,
} from "lucide-react";
import { useAppSelector } from "../redux/hooks";

interface NavItem {
  name: string;
  path: string;
  icon: any;
  permissions?: string[]; // Required permissions to view this nav item
}

export const Sidebar = () => {
  const { user, permissions } = useAppSelector((state) => state.auth);

  // Check if user is super admin (by slug OR by role ID 1)
  const isSuperAdmin =
    user?.assignedRole?.slug === "super-admin" ||
    user?.assignedRole?.id === 1 ||
    user?.roleId === 1;

  // Define nav items with their required permissions (using dot notation to match backend)
  const allNavItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      permissions: ["dashboard.view"],
    },
    {
      name: "Users",
      path: "/users",
      icon: Users,
      permissions: ["users.view"],
    },
    {
      name: "Videos",
      path: "/videos",
      icon: Video,
      permissions: ["videos.view"],
    },
    {
      name: "Channels",
      path: "/channels",
      icon: Tv,
      permissions: ["channels.view"],
    },
    {
      name: "Playlists",
      path: "/playlists",
      icon: ListVideo,
      permissions: ["playlists.view"],
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Tag,
      permissions: ["categories.view", "categories.manage"],
    },
    {
      name: "Comments",
      path: "/comments",
      icon: MessageSquare,
      permissions: ["comments.view"],
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      permissions: ["analytics.view", "dashboard.view"],
    },
    {
      name: "Roles & Permissions",
      path: "/roles",
      icon: Shield,
      permissions: ["roles.view", "roles.manage", "roles.edit", "roles.create"],
    },
    {
      name: "Admin Users",
      path: "/admin-users",
      icon: UserCog,
      permissions: ["roles.view", "roles.manage", "users.create"],
    },
    {
      name: "Payments",
      path: "/payments",
      icon: DollarSign,
      permissions: ["payments.view", "transactions.view", "revenue.view"],
    },
    {
      name: "Monetization",
      path: "/monetization",
      icon: DollarSign,
      permissions: [
        "payments.view",
        "monetization.view",
        "monetization.manage",
      ],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
      permissions: ["reports.view", "reports.export"],
    },
    {
      name: "Support",
      path: "/support",
      icon: Headphones,
      permissions: ["support.view", "support.handle"],
    },
    {
      name: "Subscription Plans",
      path: "/subscription-plans",
      icon: CreditCard,
      permissions: [
        "subscriptions.view",
        "subscriptions.manage",
        "packages.manage",
      ],
    },
    {
      name: "User Subscriptions",
      path: "/subscriptions",
      icon: CreditCard,
      permissions: ["subscriptions.view", "subscriptions.manage"],
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      permissions: [
        "notifications.view",
        "notifications.send",
        "notifications.manage",
      ],
    },
    {
      name: "Configuration",
      path: "/config",
      icon: Key,
      permissions: [
        "settings.view",
        "settings.edit",
        "config.view",
        "config.edit",
      ],
    },
    {
      name: "Payment Gateways",
      path: "/payment-gateways",
      icon: CreditCard,
      permissions: [
        "payments.view",
        "settings.edit",
        "gateways.view",
        "gateways.manage",
      ],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      permissions: ["settings.view"],
    },
  ];

  // Filter nav items based on user permissions
  const navItems = allNavItems.filter((item) => {
    // Super admin can see everything
    if (isSuperAdmin) return true;

    // If no permissions required, show to everyone
    if (!item.permissions || item.permissions.length === 0) return true;

    // Check if user has at least one of the required permissions
    return item.permissions.some((perm) => permissions.includes(perm));
  });

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Tv className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ZTV Admin</h1>
            <p className="text-xs text-gray-400">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 sidebar-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
};
