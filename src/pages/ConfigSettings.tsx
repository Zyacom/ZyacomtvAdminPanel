import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Key,
  Upload,
  Shield,
  Bell,
  Video,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import systemConfigService, {
  SystemConfigs,
} from "../services/systemConfigService";

// Default config structure for initial state
// Note: Monetization rules are managed separately in the monetization_rules table
const DEFAULT_CONFIG: SystemConfigs = {
  upload: {
    maxFileSize: 2048,
    allowedFormats: ["mp4", "mov", "avi", "mkv"],
    maxVideoDuration: 60,
    maxUploadsPerDay: 10,
  },
  content: {
    autoModeration: true,
    manualReviewRequired: false,
    copyrightCheckEnabled: true,
    profanityFilterEnabled: true,
  },
  subscription: {
    freeTrialDays: 14,
    allowCancellation: true,
    prorateBilling: true,
    gracePeriodDays: 3,
  },
  notifications: {
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    weeklyDigestEnabled: true,
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
  },
};

export const ConfigSettings = () => {
  const [config, setConfig] = useState<SystemConfigs>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] =
    useState<SystemConfigs>(DEFAULT_CONFIG);

  // Fetch configurations from API
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await systemConfigService.getConfigs();
      if (response?.configs) {
        setConfig(response.configs);
        setOriginalConfig(response.configs);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast.error("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Save all configurations
  const handleSave = async () => {
    try {
      setSaving(true);

      // Build the updates array from changes
      const updates: Array<{
        category: string;
        key: string;
        value: string | number | boolean | string[];
      }> = [];

      // Compare and collect changes
      for (const [category, categoryConfig] of Object.entries(config)) {
        const originalCategory =
          originalConfig[category as keyof SystemConfigs];
        for (const [key, value] of Object.entries(categoryConfig)) {
          const originalValue =
            originalCategory[key as keyof typeof originalCategory];
          if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
            updates.push({
              category,
              key,
              value: value as string | number | boolean | string[],
            });
          }
        }
      }

      if (updates.length === 0) {
        toast.info("No changes to save");
        return;
      }

      console.log("Saving updates:", updates);
      const response = await systemConfigService.bulkUpdateConfigs(updates);
      console.log("Save response:", response);

      if (response?.status) {
        toast.success("Configuration saved successfully!");
        setOriginalConfig(config);
        setHasChanges(false);
      } else {
        toast.error(response?.message || "Failed to save configurations");
      }
    } catch (error) {
      console.error("Error saving configurations:", error);
      toast.error("Failed to save configurations");
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all configurations to default values?",
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await systemConfigService.resetConfigs();
      if (response?.configs) {
        setConfig(response.configs);
        setOriginalConfig(response.configs);
        setHasChanges(false);
        toast.success("Configurations reset to defaults");
      }
    } catch (error) {
      console.error("Error resetting configurations:", error);
      toast.error("Failed to reset configurations");
    } finally {
      setSaving(false);
    }
  };

  // Update a config value and track changes
  const updateConfig = <T extends keyof SystemConfigs>(
    section: T,
    key: keyof SystemConfigs[T],
    value: SystemConfigs[T][keyof SystemConfigs[T]],
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 via-gray-800 to-zinc-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Settings className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                System Configuration
              </h1>
            </div>
            <p className="text-gray-300 font-medium">
              Manage platform-wide settings and configurations
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={fetchConfigs}
              disabled={saving}
            >
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
            <Button variant="danger" onClick={handleReset} disabled={saving}>
              <RotateCcw size={18} className="mr-2" />
              Reset Defaults
            </Button>
            <Button
              variant="success"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-200 text-sm font-medium">
              ⚠️ You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}
      </div>

      {/* Config Sections */}
      {/* Note: Monetization settings are managed in the dedicated Monetization Rules page */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Settings */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Upload Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={config.upload.maxFileSize}
                onChange={(e) =>
                  updateConfig(
                    "upload",
                    "maxFileSize",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max Video Duration (minutes)
              </label>
              <input
                type="number"
                value={config.upload.maxVideoDuration}
                onChange={(e) =>
                  updateConfig(
                    "upload",
                    "maxVideoDuration",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max Uploads Per Day
              </label>
              <input
                type="number"
                value={config.upload.maxUploadsPerDay}
                onChange={(e) =>
                  updateConfig(
                    "upload",
                    "maxUploadsPerDay",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Allowed Formats (comma-separated)
              </label>
              <input
                type="text"
                value={config.upload.allowedFormats.join(", ")}
                onChange={(e) =>
                  updateConfig(
                    "upload",
                    "allowedFormats",
                    e.target.value
                      .split(",")
                      .map((f) => f.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="mp4, mov, avi, mkv"
              />
            </div>
          </div>
        </div>

        {/* Content Moderation */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Content Moderation
            </h2>
          </div>
          <div className="space-y-4">
            {Object.entries(config.content).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span className="font-bold text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) =>
                      updateConfig(
                        "content",
                        key as keyof typeof config.content,
                        e.target.checked,
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Security
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={config.security.sessionTimeout}
                onChange={(e) =>
                  updateConfig(
                    "security",
                    "sessionTimeout",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={config.security.maxLoginAttempts}
                onChange={(e) =>
                  updateConfig(
                    "security",
                    "maxLoginAttempts",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password Min Length
              </label>
              <input
                type="number"
                value={config.security.passwordMinLength}
                onChange={(e) =>
                  updateConfig(
                    "security",
                    "passwordMinLength",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-900">
                Two-Factor Required
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.twoFactorRequired}
                  onChange={(e) =>
                    updateConfig(
                      "security",
                      "twoFactorRequired",
                      e.target.checked,
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="text-yellow-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Notifications
            </h2>
          </div>
          <div className="space-y-4">
            {Object.entries(config.notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <span className="font-bold text-gray-900 capitalize">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace("Enabled", "")
                    .trim()}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) =>
                      updateConfig(
                        "notifications",
                        key as keyof typeof config.notifications,
                        e.target.checked,
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Key className="text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Subscription
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Free Trial Days
              </label>
              <input
                type="number"
                value={config.subscription.freeTrialDays}
                onChange={(e) =>
                  updateConfig(
                    "subscription",
                    "freeTrialDays",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Grace Period Days
              </label>
              <input
                type="number"
                value={config.subscription.gracePeriodDays}
                onChange={(e) =>
                  updateConfig(
                    "subscription",
                    "gracePeriodDays",
                    parseInt(e.target.value) || 0,
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-900">
                Allow Cancellation
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.subscription.allowCancellation}
                  onChange={(e) =>
                    updateConfig(
                      "subscription",
                      "allowCancellation",
                      e.target.checked,
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-900">Prorate Billing</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.subscription.prorateBilling}
                  onChange={(e) =>
                    updateConfig(
                      "subscription",
                      "prorateBilling",
                      e.target.checked,
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
