import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { refreshUserPermissions } from "../redux/slices/authSlice";

export const Layout = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Function to refresh permissions
  const refreshPermissions = useCallback(() => {
    if (isAuthenticated) {
      dispatch(refreshUserPermissions());
    }
  }, [dispatch, isAuthenticated]);

  // Refresh permissions on window focus (when user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      refreshPermissions();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refreshPermissions]);

  // Refresh permissions periodically (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPermissions();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [refreshPermissions]);

  // Also refresh on initial mount
  useEffect(() => {
    refreshPermissions();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-linear-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
