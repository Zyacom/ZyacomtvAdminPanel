// Permission Categories and Definitions
export const PERMISSION_CATEGORIES = {
  DASHBOARD: "Dashboard & Analytics",
  USERS: "User Management",
  CONTENT: "Content Management",
  MODERATION: "Content Moderation",
  FINANCIAL: "Financial Management",
  PLATFORM: "Platform Configuration",
  SYSTEM: "System Administration",
} as const;

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  route?: string;
}

// All available permissions with route mappings
export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard & Analytics
  {
    id: "dashboard.view",
    name: "View Dashboard",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    description: "Access to main dashboard and overview statistics",
    route: "/",
  },
  {
    id: "analytics.view",
    name: "View Analytics",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    description: "Access to detailed analytics and reports",
    route: "/analytics",
  },
  {
    id: "reports.view",
    name: "View Reports",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    description: "Access to view generated reports",
    route: "/reports",
  },
  {
    id: "reports.generate",
    name: "Generate Reports",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    description: "Generate new reports and export data",
    route: "/reports",
  },

  // User Management
  {
    id: "users.view",
    name: "View Users",
    category: PERMISSION_CATEGORIES.USERS,
    description: "View user list and basic information",
    route: "/users",
  },
  {
    id: "users.create",
    name: "Create Users",
    category: PERMISSION_CATEGORIES.USERS,
    description: "Create new user accounts",
    route: "/users",
  },
  {
    id: "users.edit",
    name: "Edit Users",
    category: PERMISSION_CATEGORIES.USERS,
    description: "Edit existing user information",
    route: "/users",
  },
  {
    id: "users.delete",
    name: "Delete Users",
    category: PERMISSION_CATEGORIES.USERS,
    description: "Delete user accounts",
    route: "/users",
  },
  {
    id: "users.ban",
    name: "Ban/Suspend Users",
    category: PERMISSION_CATEGORIES.USERS,
    description: "Ban or suspend user accounts",
    route: "/users",
  },

  // Content Management
  {
    id: "videos.view",
    name: "View Videos",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "View all videos on the platform",
    route: "/videos",
  },
  {
    id: "videos.edit",
    name: "Edit Videos",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Edit video information and metadata",
    route: "/videos",
  },
  {
    id: "videos.delete",
    name: "Delete Videos",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Delete videos from the platform",
    route: "/videos",
  },
  {
    id: "channels.view",
    name: "View Channels",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "View all channels on the platform",
    route: "/channels",
  },
  {
    id: "channels.edit",
    name: "Edit Channels",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Edit channel information",
    route: "/channels",
  },
  {
    id: "channels.delete",
    name: "Delete Channels",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Delete channels from the platform",
    route: "/channels",
  },
  {
    id: "playlists.view",
    name: "View Playlists",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "View all playlists",
    route: "/playlists",
  },
  {
    id: "playlists.manage",
    name: "Manage Playlists",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Create, edit, and delete playlists",
    route: "/playlists",
  },
  {
    id: "categories.view",
    name: "View Categories",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "View content categories",
    route: "/categories",
  },
  {
    id: "categories.manage",
    name: "Manage Categories",
    category: PERMISSION_CATEGORIES.CONTENT,
    description: "Create, edit, and delete categories",
    route: "/categories",
  },

  // Content Moderation
  {
    id: "comments.view",
    name: "View Comments",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "View all user comments",
    route: "/comments",
  },
  {
    id: "comments.moderate",
    name: "Moderate Comments",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Approve, reject, or delete comments",
    route: "/comments",
  },
  {
    id: "content.flag",
    name: "Flag Content",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Flag inappropriate content for review",
    route: "/videos",
  },
  {
    id: "content.review",
    name: "Review Flagged Content",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Review and take action on flagged content",
    route: "/videos",
  },

  // Financial Management
  {
    id: "payments.view",
    name: "View Payments",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View payment transactions",
    route: "/payments",
  },
  {
    id: "payments.process",
    name: "Process Payments",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Process payouts and refunds",
    route: "/payments",
  },
  {
    id: "payments.export",
    name: "Export Payments",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Export payment data to CSV",
    route: "/payments",
  },
  {
    id: "payments.refund",
    name: "Process Refunds",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Process refunds for transactions",
    route: "/payments",
  },
  {
    id: "subscriptions.view",
    name: "View Subscriptions",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View subscription plans and users",
    route: "/subscriptions",
  },
  {
    id: "subscriptions.manage",
    name: "Manage Subscriptions",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Create and edit subscription plans",
    route: "/subscriptions",
  },

  // Platform Configuration
  {
    id: "config.view",
    name: "View Configuration",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "View platform settings",
    route: "/config",
  },
  {
    id: "config.edit",
    name: "Edit Configuration",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Modify platform settings",
    route: "/config",
  },
  {
    id: "notifications.view",
    name: "View Notifications",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "View system notifications",
    route: "/notifications",
  },
  {
    id: "notifications.send",
    name: "Send Notifications",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Send notifications to users",
    route: "/notifications",
  },
  {
    id: "support.view",
    name: "View Support Tickets",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "View user support requests",
    route: "/support",
  },
  {
    id: "support.respond",
    name: "Respond to Support",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Respond to and resolve support tickets",
    route: "/support",
  },

  // System Administration
  {
    id: "roles.view",
    name: "View Roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "View user roles and permissions",
    route: "/roles",
  },
  {
    id: "roles.manage",
    name: "Manage Roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "Create and edit user roles and permissions",
    route: "/roles",
  },
  {
    id: "roles.create",
    name: "Create Roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "Create new roles",
    route: "/roles",
  },
  {
    id: "roles.edit",
    name: "Edit Roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "Edit existing roles",
    route: "/roles",
  },
  {
    id: "roles.delete",
    name: "Delete Roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "Delete roles",
    route: "/roles",
  },
  {
    id: "settings.view",
    name: "View Settings",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "View admin account settings",
    route: "/settings",
  },
  {
    id: "settings.edit",
    name: "Edit Settings",
    category: PERMISSION_CATEGORIES.SYSTEM,
    description: "Modify admin account settings",
    route: "/settings",
  },

  // Additional Financial
  {
    id: "transactions.view",
    name: "View Transactions",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View transaction history",
    route: "/payments",
  },
  {
    id: "revenue.view",
    name: "View Revenue",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View revenue data",
    route: "/payments",
  },
  {
    id: "monetization.view",
    name: "View Monetization",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View monetization requests",
    route: "/monetization",
  },
  {
    id: "monetization.manage",
    name: "Manage Monetization",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Approve/reject monetization requests",
    route: "/monetization",
  },
  {
    id: "gateways.view",
    name: "View Payment Gateways",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "View payment gateway settings",
    route: "/payment-gateways",
  },
  {
    id: "gateways.manage",
    name: "Manage Payment Gateways",
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: "Configure payment gateways",
    route: "/payment-gateways",
  },

  // Additional Platform
  {
    id: "notifications.manage",
    name: "Manage Notifications",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Manage notification templates",
    route: "/notifications",
  },
  {
    id: "packages.manage",
    name: "Manage Packages",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Manage subscription packages",
    route: "/subscription-plans",
  },

  // Additional Comments/Moderation
  {
    id: "comments.restore",
    name: "Restore Comments",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Restore deleted comments",
    route: "/comments",
  },
  {
    id: "comments.edit",
    name: "Edit Comments",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Edit user comments",
    route: "/comments",
  },
  {
    id: "comments.delete",
    name: "Delete Comments",
    category: PERMISSION_CATEGORIES.MODERATION,
    description: "Delete user comments",
    route: "/comments",
  },
  {
    id: "support.handle",
    name: "Handle Support",
    category: PERMISSION_CATEGORIES.PLATFORM,
    description: "Handle support tickets",
    route: "/support",
  },
  {
    id: "reports.export",
    name: "Export Reports",
    category: PERMISSION_CATEGORIES.DASHBOARD,
    description: "Export reports to file",
    route: "/reports",
  },
];

// Route to permission mapping (using dot notation to match backend)
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/": ["dashboard.view"],
  "/dashboard": ["dashboard.view"],
  "/analytics": ["analytics.view"],
  "/reports": ["reports.view", "reports.export"],
  "/users": ["users.view"],
  "/videos": ["videos.view"],
  "/channels": ["channels.view"],
  "/playlists": ["playlists.view"],
  "/categories": ["categories.view"],
  "/comments": ["comments.view"],
  "/payments": ["payments.view", "transactions.view", "revenue.view"],
  "/subscriptions": ["subscriptions.view", "subscriptions.manage"],
  "/subscription-plans": [
    "subscriptions.view",
    "subscriptions.manage",
    "packages.manage",
  ],
  "/config": ["settings.view", "settings.edit", "config.view", "config.edit"],
  "/notifications": [
    "notifications.view",
    "notifications.send",
    "notifications.manage",
  ],
  "/support": ["support.view", "support.handle"],
  "/roles": ["roles.view", "roles.manage", "roles.edit", "roles.create"],
  "/admin-users": ["roles.view", "users.create"],
  "/settings": ["settings.view"],
  "/payment-gateways": [
    "payments.view",
    "settings.edit",
    "gateways.view",
    "gateways.manage",
  ],
  "/monetization": [
    "payments.view",
    "monetization.view",
    "monetization.manage",
  ],
};

// Check if user has specific permission
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string | string[],
): boolean => {
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some((perm) => userPermissions.includes(perm));
  }
  return userPermissions.includes(requiredPermission);
};

// Check if user can access a route
export const canAccessRoute = (
  userPermissions: string[],
  route: string,
): boolean => {
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No permissions required
  }
  return hasPermission(userPermissions, requiredPermissions);
};

// Get all accessible routes for a user
export const getAccessibleRoutes = (userPermissions: string[]): string[] => {
  return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
    canAccessRoute(userPermissions, route),
  );
};

// Get permissions by category
export const getPermissionsByCategory = (category: string): Permission[] => {
  return ALL_PERMISSIONS.filter((perm) => perm.category === category);
};
