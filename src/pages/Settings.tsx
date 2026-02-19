import {
  Settings as SettingsIcon,
  Save,
  Mail,
  Bell,
  Shield,
  User,
} from "lucide-react";
import { Button } from "../components/Button";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

interface SettingsData {
  platformName: string;
  supportEmail: string;
  adminEmail: string;
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  sessionTimeout: string;
  emailNotifications: boolean;
  newUserAlerts: boolean;
  contentModeration: boolean;
  theme: string;
  language: string;
  timezone: string;
}

const defaultSettings: SettingsData = {
  platformName: "ZTV",
  supportEmail: "support@ztv.com",
  adminEmail: "admin@ztv.com",
  twoFactorAuth: true,
  loginNotifications: true,
  sessionTimeout: "30 minutes",
  emailNotifications: true,
  newUserAlerts: true,
  contentModeration: true,
  theme: "Light Mode",
  language: "English",
  timezone: "UTC",
};

export const Settings = () => {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [emailErrors, setEmailErrors] = useState({
    supportEmail: "",
    adminEmail: "",
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (
    field: "supportEmail" | "adminEmail",
    value: string,
  ) => {
    setSettings({ ...settings, [field]: value });

    // Clear error when user starts typing
    if (emailErrors[field]) {
      setEmailErrors({ ...emailErrors, [field]: "" });
    }
  };

  const handleSave = () => {
    // Validate emails
    const errors = {
      supportEmail: "",
      adminEmail: "",
    };

    if (!validateEmail(settings.supportEmail)) {
      errors.supportEmail = "Please enter a valid email address";
    }

    if (!validateEmail(settings.adminEmail)) {
      errors.adminEmail = "Please enter a valid email address";
    }

    if (errors.supportEmail || errors.adminEmail) {
      setEmailErrors(errors);
      toast.error("Please fix the validation errors before saving");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("adminSettings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon size={40} />
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>
        <p className="text-orange-100 text-lg">
          Manage your admin panel preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              General Settings
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) =>
                  setSettings({ ...settings, platformName: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Support Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    handleEmailChange("supportEmail", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    emailErrors.supportEmail
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {emailErrors.supportEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {emailErrors.supportEmail}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    handleEmailChange("adminEmail", e.target.value)
                  }
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    emailErrors.adminEmail
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {emailErrors.adminEmail && (
                <p className="mt-1 text-sm text-red-600">
                  {emailErrors.adminEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="text-red-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.twoFactorAuth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twoFactorAuth: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">Login Notifications</p>
                <p className="text-sm text-gray-600">
                  Get notified of new login attempts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.loginNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      loginNotifications: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">
                  Auto-logout after inactivity
                </p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: e.target.value })
                }
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">New User Alerts</p>
                <p className="text-sm text-gray-600">
                  Get notified of new registrations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.newUserAlerts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      newUserAlerts: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-bold text-gray-900">Content Moderation</p>
                <p className="text-sm text-gray-600">
                  Alerts for flagged content
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.contentModeration}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contentModeration: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SettingsIcon className="text-purple-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">System</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Light Mode</option>
                <option>Dark Mode</option>
                <option>Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>GMT</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          className="px-8"
        >
          <Save size={18} className="mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
