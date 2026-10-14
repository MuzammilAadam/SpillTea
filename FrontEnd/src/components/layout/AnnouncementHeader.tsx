import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HeartHandshake, Sparkles } from 'lucide-react';
import { UserProfile, NotificationItem } from '../../types';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface AnnouncementHeaderProps {
  onOpenSupport: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount: number;
  onNavigate: (view: string) => void;
  currentUser: UserProfile;
  onOpenSearch: () => void;
  onOpenAuth?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  notifications?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notif: NotificationItem) => void;
}

export const AnnouncementHeader: React.FC<AnnouncementHeaderProps> = ({
  onOpenSupport,
  onOpenNotifications,
  unreadNotificationsCount,
  onNavigate,
  currentUser,
  onOpenSearch,
  onOpenAuth,
  isAuthenticated = false,
  onLogout,
  notifications = [],
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleBellClick = () => {
    setIsDropdownOpen((prev) => !prev);
    if (onOpenNotifications) {
      onOpenNotifications();
    }
  };
  return (
    <div className="w-full bg-[#F7DDE1]/60 border-b border-[#E9D9C9] px-4 py-2 text-xs text-[#44352F]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left tagline */}
        <div className="flex items-center gap-2">
          <span className="font-editorial italic tracking-wide text-sm text-[#44352F]">
            “Some things are easier to say here.”
          </span>
          <span className="hidden sm:inline-block text-[#B98289]">•</span>
          <span className="hidden sm:inline-block font-sans-clean text-[11px] text-[#666747]">
            A quiet sanctuary for anonymous feelings & heartfelt listening
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 hover:bg-white text-[#44352F] border border-[#E9D9C9] transition-all cursor-pointer text-[11px]"
            title="Search stories"
          >
            <Search className="w-3 h-3 text-[#B98289]" />
            <span className="hidden md:inline">Search letters...</span>
          </button>

          <button
            onClick={onOpenSupport}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#B7B99A]/30 hover:bg-[#B7B99A]/50 text-[#666747] border border-[#B7B99A]/40 transition-colors text-[11px] cursor-pointer"
            title="Urgent emotional support resources"
          >
            <HeartHandshake className="w-3 h-3 text-[#666747]" />
            <span>Need Help?</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className={`relative p-1.5 rounded-full transition-colors cursor-pointer ${
                unreadNotificationsCount > 0
                  ? 'hover:bg-[#F7DDE1]/60 animate-notif-ping'
                  : 'hover:bg-white/80'
              } text-[#44352F]`}
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-3.5 h-3.5 text-[#B98289]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B98289] text-white text-[9px] flex items-center justify-center font-bold animate-badge-pop">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={() => onMarkAllAsRead && onMarkAllAsRead()}
              onNotificationClick={(notif) => {
                setIsDropdownOpen(false);
                if (onNotificationClick) onNotificationClick(notif);
              }}
              onViewAll={() => {
                setIsDropdownOpen(false);
                onNavigate('notifications');
              }}
              unreadCount={unreadNotificationsCount}
            />
          </div>


          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full hover:bg-white/60 transition-colors cursor-pointer border border-transparent hover:border-[#E9D9C9]"
                title="Go to my profile & moodboard"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.pseudonym}
                  className="w-5 h-5 rounded-full object-cover border border-[#D8A0A5]"
                />
                <span className="text-[11px] font-medium text-[#44352F] hidden lg:inline">
                  @{currentUser.pseudonym}
                </span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-[10px] text-[#A84855] hover:underline px-1.5 py-0.5 cursor-pointer"
                  title="Sign out of journal"
                >
                  Exit
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#B98289] text-white hover:bg-[#A66D74] transition-all text-[11px] font-serif font-medium cursor-pointer shadow-2xs"
            >
              <span>Sign In / Pen Name</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
