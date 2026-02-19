import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Tv,
  PlayCircle,
  Users,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { authService } from "../services/authService";
import { setCredentials } from "../redux/slices/authSlice";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.trim().length > 0 && !loading,
    [email, password, loading],
  );

  // Define route permissions for determining first accessible page
  const routePermissions = [
    { path: "/dashboard", permissions: ["dashboard.view"] },
    { path: "/users", permissions: ["users.view"] },
    { path: "/videos", permissions: ["videos.view"] },
    { path: "/channels", permissions: ["channels.view"] },
    { path: "/playlists", permissions: ["playlists.view"] },
    { path: "/categories", permissions: ["categories.view"] },
    { path: "/comments", permissions: ["comments.view"] },
    { path: "/analytics", permissions: ["analytics.view"] },
    { path: "/roles", permissions: ["roles.view"] },
    { path: "/payments", permissions: ["payments.view"] },
    { path: "/reports", permissions: ["reports.view"] },
    { path: "/support", permissions: ["support.view"] },
    { path: "/subscription-plans", permissions: ["subscriptions.view"] },
    { path: "/subscriptions", permissions: ["subscriptions.view"] },
    { path: "/notifications", permissions: ["notifications.view"] },
    { path: "/config", permissions: ["settings.view"] },
    { path: "/settings", permissions: ["settings.view"] },
  ];

  // Get first accessible route based on user permissions
  const getFirstAccessibleRoute = (
    userPermissions: string[],
    roleSlug?: string,
  ): string => {
    // Super admin always goes to dashboard
    if (roleSlug === "super-admin") {
      return "/dashboard";
    }

    // Find first route user has permission for
    for (const route of routePermissions) {
      const hasAccess = route.permissions.some((perm) =>
        userPermissions.includes(perm),
      );
      if (hasAccess) {
        return route.path;
      }
    }

    // Fallback to unauthorized if no permissions
    return "/unauthorized";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.data.status) {
        const { user, token } = response.data;

        // User object already contains permissions from backend
        const userWithPermissions = {
          ...user,
          permissions: user.permissions || [],
        };

        // Store token
        const tokenString = token.token;
        if (rememberMe) {
          localStorage.setItem("token", tokenString);
          localStorage.setItem(
            "adminUser",
            JSON.stringify(userWithPermissions),
          );
        } else {
          sessionStorage.setItem("token", tokenString);
          sessionStorage.setItem(
            "adminUser",
            JSON.stringify(userWithPermissions),
          );
        }

        // Update Redux store
        dispatch(
          setCredentials({ user: userWithPermissions, token: tokenString }),
        );

        toast.success(`Welcome back, ${user.firstName || user.username}!`);

        // Navigate to first accessible page based on permissions
        const firstRoute = getFirstAccessibleRoute(
          userWithPermissions.permissions,
          userWithPermissions.assignedRole?.slug,
        );
        navigate(firstRoute);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />
      </div>

      {/* PERFECT CENTER WRAPPER */}
      <div className="relative z-10 grid min-h-screen place-items-center px-6 py-10">
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* LEFT */}
            <div className="hidden lg:block">
              <div className="mx-auto w-full max-w-xl">
                {/* logo row aligned */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 blur-xl opacity-60" />
                    <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 shadow-2xl">
                      <Tv size={32} className="text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="leading-tight">
                    <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                      ZTV
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-purple-200/90">
                      Admin Portal
                    </p>
                  </div>
                </div>

                <div className="mt-12">
                  <h2 className="text-5xl font-black tracking-tight text-white leading-[1.05]">
                    Manage Your
                    <br />
                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                      Video Platform
                    </span>
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300/90">
                    Comprehensive admin dashboard with powerful analytics,
                    real-time insights, and complete platform control.
                  </p>
                </div>

                {/* equal-height stat cards */}
                <div className="mt-10 grid grid-cols-3 gap-6">
                  {[
                    { icon: Users, label: "Users", value: "10K+" },
                    { icon: PlayCircle, label: "Videos", value: "50K+" },
                    { icon: BarChart3, label: "Uptime", value: "99.9%" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="h-full rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl"
                    >
                      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                        <Icon
                          className="text-white"
                          size={22}
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="text-3xl font-black text-white leading-none">
                        {value}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-300/70">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 backdrop-blur-xl">
                  <Shield
                    className="text-emerald-300"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <span className="text-sm font-bold text-white/90">
                    Bank-Level Security
                  </span>
                  <Sparkles className="text-yellow-300" size={16} />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="mx-auto w-full max-w-md">
              {/* Mobile logo - centered */}
              <div className="lg:hidden mb-10 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 blur-xl opacity-60" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl">
                    <Tv size={40} className="text-white" strokeWidth={2} />
                  </div>
                </div>
                <h1 className="mt-4 text-3xl font-black text-white leading-none">
                  ZTV Admin
                </h1>
                <p className="mt-2 text-sm font-semibold text-white/60">
                  Secure access
                </p>
              </div>

              {/* Card */}
              <div className="rounded-[28px] bg-white/95 p-10 shadow-2xl backdrop-blur-2xl sm:p-12">
                <div className="text-center">
                  <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                    Welcome back
                  </h2>
                  <p className="mt-3 text-base font-semibold text-slate-500">
                    Please enter your details to continue
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  {/* EMAIL — FLEX ROW (PERFECT ALIGNMENT) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                      Email
                    </label>

                    <div className="flex h-16 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-500/15">
                      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-slate-100">
                        <Mail
                          size={18}
                          className="text-slate-500"
                          strokeWidth={2.5}
                        />
                      </div>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="h-full w-full bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* PASSWORD — FLEX ROW (PERFECT ALIGNMENT) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-[0.14em] text-slate-700">
                      Password
                    </label>

                    <div className="flex h-16 items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 focus-within:border-purple-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-purple-500/15">
                      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-slate-100">
                        <Lock
                          size={18}
                          className="text-slate-500"
                          strokeWidth={2.5}
                        />
                      </div>

                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="h-full w-full bg-transparent text-base font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            size={18}
                            className="text-slate-600"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Eye
                            size={18}
                            className="text-slate-600"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot aligned */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-5 w-5 rounded-md border-2 border-slate-300 text-purple-600 focus:ring-4 focus:ring-purple-500/15"
                      />
                      <span className="text-sm font-bold text-slate-700">
                        Keep me signed in
                      </span>
                    </label>

                    <button
                      type="button"
                      className="text-sm font-black text-purple-700 hover:text-purple-800 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Button content perfectly centered */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group relative h-16 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-lg font-black text-white shadow-xl shadow-purple-500/20 transition-all hover:shadow-2xl hover:shadow-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-500/35 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    <span className="inline-flex w-full items-center justify-center gap-3">
                      {loading ? (
                        <>
                          <svg
                            className="h-6 w-6 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Signing in…
                        </>
                      ) : (
                        <>
                          <Shield size={22} strokeWidth={2.5} />
                          Sign In
                          <ArrowRight
                            size={22}
                            strokeWidth={2.5}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-center gap-2.5">
                    <Shield
                      size={16}
                      className="text-emerald-600"
                      strokeWidth={2.5}
                    />
                    <span className="text-sm font-bold text-slate-600">
                      Protected by 256-bit encryption
                    </span>
                  </div>
                </div>
              </div>

              {/* bottom links centered */}
              <div className="mt-8 text-center">
                <p className="text-sm font-semibold text-white/55">
                  © 2026 ZTV. All rights reserved.
                </p>
                <div className="mt-3 flex items-center justify-center gap-4">
                  <a
                    href="#"
                    className="text-sm font-black text-purple-300/90 hover:text-purple-200"
                  >
                    Terms
                  </a>
                  <span className="text-white/20">•</span>
                  <a
                    href="#"
                    className="text-sm font-black text-purple-300/90 hover:text-purple-200"
                  >
                    Privacy
                  </a>
                  <span className="text-white/20">•</span>
                  <a
                    href="#"
                    className="text-sm font-black text-purple-300/90 hover:text-purple-200"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
            {/* END RIGHT */}
          </div>
        </div>
      </div>
    </div>
  );
};
