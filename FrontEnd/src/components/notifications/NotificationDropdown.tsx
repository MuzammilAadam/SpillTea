import React from 'react';
import { NotificationItem } from '../../types';
import { Check, Heart, MessageCircle, Sparkles, Bookmark, ArrowRight, ExternalLink } from 'lucide-react';
import { TeacupIcon, PressedFlower } from '../common/Botanicals';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
  onViewAll: () => void;
  unreadCount: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
  onViewAll,
  unreadCount,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reply':
        return <MessageCircle className="w-3.5 h-3.5 text-[#B98289]" />;
      case 'reaction':
        return <Heart className="w-3.5 h-3.5 text-[#D8A0A5] fill-[#D8A0A5]" />;
      case 'saved_update':
        return <Bookmark className="w-3.5 h-3.5 text-[#666747]" />;
      case 'comfort':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#B7B99A]" />;
    }
  };

  const recentList = notifications.slice(0, 5);

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] shadow-2xl z-50 overflow-hidden animate-fadeIn"
      style={{
        backgroundImage: 'radial-gradient(#e5dfd3 0.75px, transparent 0.75px)',
        backgroundSize: '16px 16px',
      }}
    >
      {/* Header */}
      <div className="p-3.5 px-4 bg-[#FFF8F0] border-b border-[#E9D9C9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TeacupIcon className="w-4 h-4 text-[#B98289]" />
          <span className="font-editorial font-bold text-base text-[#44352F]">
            Quiet Whispers
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B98289] text-white font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-[#666747] hover:text-[#B98289] font-serif cursor-pointer hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#E9D9C9]/50">
        {recentList.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onNotificationClick(notif)}
            className={`p-3.5 px-4 transition-all cursor-pointer flex items-start gap-3 hover:bg-[#FFF8F0] ${
              notif.read ? 'bg-[#FFFCF8]/60 opacity-80' : 'bg-[#FFF0F2]/40'
            }`}
          >
            {/* Avatar or preset illustration */}
            <div className="relative shrink-0 mt-0.5">
              {notif.actorAvatar ? (
                <img
                  src={notif.actorAvatar}
                  alt={notif.actorPseudonym || 'Someone'}
                  className="w-8 h-8 rounded-full object-cover border border-[#D8A0A5]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] flex items-center justify-center">
                  {getIcon(notif.type)}
                </div>
              )}
              {!notif.read && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#B98289] rounded-full ring-2 ring-white" />
              )}
            </div>

            {/* Notification content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs font-serif font-bold text-[#44352F] truncate">
                  {notif.actorPseudonym || notif.title}
                </span>
                <span className="text-[10px] text-[#666747] font-mono shrink-0">
                  {notif.timestamp}
                </span>
              </div>
              <p className="font-body text-xs text-[#44352F]/90 leading-snug line-clamp-2">
                {notif.description}
              </p>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-10 text-center px-4">
            <PressedFlower className="w-8 h-8 text-[#D8A0A5] mx-auto mb-2 opacity-50" />
            <p className="font-note text-lg text-[#666747]">All is peaceful and quiet here.</p>
            <p className="text-[11px] font-sans-clean text-[#666747]/70 mt-0.5">No whispers yet.</p>
          </div>
        )}
      </div>

      {/* Footer view-all link */}
      <div className="p-2.5 px-4 bg-[#FFF8F0] border-t border-[#E9D9C9] flex items-center justify-between text-xs font-serif">
        <span className="text-[#666747] text-[11px]">Unread whispers: {unreadCount}</span>
        <button
          onClick={() => {
            onClose();
            onViewAll();
          }}
          className="text-[#B98289] hover:text-[#44352F] font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>View all notifications</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
