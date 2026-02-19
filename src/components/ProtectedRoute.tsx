import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { hasPermission, ROUTE_PERMISSIONS } from "../utils/permissions";
import { ReactNode } from "react";

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { permissions, user, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super admin bypass - has all permissions (check by slug OR by role ID 1)
  const isSuperAdmin =
    user?.assignedRole?.slug === "super-admin" ||
    user?.assignedRole?.id === 1 ||
    user?.roleId === 1;

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check route-based permissions
  const routePermissions = ROUTE_PERMISSIONS[location.pathname];
  const effectivePermissions = requiredPermissions || routePermissions;

  if (effectivePermissions && effectivePermissions.length > 0) {
    const hasAccess = requireAll
      ? effectivePermissions.every((p) => permissions.includes(p))
      : hasPermission(permissions, effectivePermissions);

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Component to conditionally render based on permissions
interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({
  children,
  permissions: requiredPermissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) => {
  const { permissions, user } = useAppSelector((state) => state.auth);

  // Super admin bypass (check by slug OR by role ID 1)
  const isSuperAdmin =
    user?.assignedRole?.slug === "super-admin" ||
    user?.assignedRole?.id === 1 ||
    user?.roleId === 1;

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const permsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  const hasAccess = requireAll
    ? permsArray.every((p) => permissions.includes(p))
    : permsArray.some((p) => permissions.includes(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Hook to check permissions
export const usePermission = (
  requiredPermissions: string | string[],
  requireAll = false,
) => {
  const { permissions, user } = useAppSelector((state) => state.auth);

  // Super admin bypass (check by slug OR by role ID 1)
  const isSuperAdmin =
    user?.assignedRole?.slug === "super-admin" ||
    user?.assignedRole?.id === 1 ||
    user?.roleId === 1;

  if (isSuperAdmin) {
    return true;
  }

  const permsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return requireAll
    ? permsArray.every((p) => permissions.includes(p))
    : permsArray.some((p) => permissions.includes(p));
};
