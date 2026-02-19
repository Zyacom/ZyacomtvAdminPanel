import { NotificationsDropdown } from "./NotificationsDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

export const Header = () => {
  return (
    <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-5 shadow-lg z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 bg-clip-text text-transparent">
            ZTV Admin Panel
          </h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Manage your streaming platform
          </p>
        </div>

        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};
