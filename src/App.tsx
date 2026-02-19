import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Login,
  Dashboard,
  Users,
  Videos,
  Channels,
  Analytics,
  Settings,
  Roles,
  UserDetail,
  UserVideos,
  UserActivity,
  UserSubscription,
  Support,
  Playlists,
  PlaylistDetail,
  Categories,
  SubscriptionPlans,
  Subscriptions,
  ConfigSettings,
  Notifications,
  Reports,
  Comments,
  Payments,
  PaymentGateways,
  Unauthorized,
  AdminUsers,
  Monetization,
} from "@/pages";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredPermissions={["dashboard.view"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermissions={["users.view"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute requiredPermissions={["users.view"]}>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/videos"
            element={
              <ProtectedRoute
                requiredPermissions={["users.view", "videos.view"]}
              >
                <UserVideos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/activity"
            element={
              <ProtectedRoute requiredPermissions={["users.view"]}>
                <UserActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/subscription"
            element={
              <ProtectedRoute
                requiredPermissions={["users.view", "subscriptions.view"]}
              >
                <UserSubscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute requiredPermissions={["videos.view"]}>
                <Videos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/channels"
            element={
              <ProtectedRoute requiredPermissions={["channels.view"]}>
                <Channels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute
                requiredPermissions={["analytics.view", "dashboard.view"]}
              >
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermissions={["roles.view"]}>
                <Roles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-users"
            element={
              <ProtectedRoute
                requiredPermissions={["roles.view", "users.create"]}
              >
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute requiredPermissions={["support.view"]}>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute requiredPermissions={["playlists.view"]}>
                <Playlists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists/:id"
            element={
              <ProtectedRoute requiredPermissions={["playlists.view"]}>
                <PlaylistDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute requiredPermissions={["categories.view"]}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription-plans"
            element={
              <ProtectedRoute requiredPermissions={["subscriptions.view"]}>
                <SubscriptionPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute requiredPermissions={["subscriptions.view"]}>
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/config"
            element={
              <ProtectedRoute requiredPermissions={["settings.view"]}>
                <ConfigSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPermissions={["settings.view"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredPermissions={["notifications.view"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                requiredPermissions={["reports.view", "reports.export"]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comments"
            element={
              <ProtectedRoute requiredPermissions={["comments.view"]}>
                <Comments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredPermissions={["payments.view"]}>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-gateways"
            element={
              <ProtectedRoute
                requiredPermissions={["payments.view", "settings.edit"]}
              >
                <PaymentGateways />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monetization"
            element={
              <ProtectedRoute requiredPermissions={["payments.view"]}>
                <Monetization />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
