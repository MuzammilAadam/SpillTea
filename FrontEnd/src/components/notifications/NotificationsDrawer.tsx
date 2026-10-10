import React from 'react';
import { NotificationItem } from '../../types';
import { X, Check, Heart, MessageCircle, Sparkles, Bookmark } from 'lucide-react';
import { TeacupIcon, PressedFlower } from '../common/Botanicals';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-[#B98289]" />;
      case 'reaction':
        return <Heart className="w-4 h-4 text-[#D8A0A5] fill-[#D8A0A5]" />;
      case 'saved_update':
        return <Bookmark className="w-4 h-4 text-[#666747]" />;
      case 'comfort':
      default:
        return <Sparkles className="w-4 h-4 text-[#B7B99A]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-fadeIn">
      <div className="w-full max-w-md bg-[#FFFCF8] h-full shadow-2xl border-l border-[#E9D9C9] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E9D9C9] flex items-center justify-between bg-[#FFF8F0]">
          <div className="flex items-center gap-2">
            <TeacupIcon className="w-5 h-5 text-[#B98289]" />
            <h3 className="font-editorial font-bold text-xl text-[#44352F]">
              Quiet Whispers
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B98289] text-white font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-[#666747] hover:text-[#B98289] font-serif cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F7DDE1]/40 text-[#44352F] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNotificationClick(notif)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white border-[#E9D9C9] opacity-80'
                  : 'bg-[#FFF8F0] border-[#D8A0A5] shadow-2xs'
              } hover:border-[#B98289]`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[#FFFCF8] border border-[#E9D9C9] shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-serif font-bold text-xs text-[#44352F] truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#666747] font-mono shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="font-body text-xs text-[#44352F]/90 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <PressedFlower className="w-8 h-8 text-[#D8A0A5] mx-auto mb-2 opacity-60" />
              <p className="font-note text-lg text-[#666747]">All is peaceful and quiet here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E9D9C9] bg-[#FFF8F0] text-center text-xs font-serif text-[#666747]">
          <span>Take your time answering. You owe no one your haste.</span>
        </div>
      </div>
    </div>
  );
};
