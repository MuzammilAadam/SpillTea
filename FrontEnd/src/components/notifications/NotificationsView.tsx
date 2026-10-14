import React, { useState } from 'react';
import { NotificationItem } from '../../types';
import { Heart, MessageCircle, Sparkles, Bookmark, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import { TeacupIcon, PressedFlower, WashiTapeStrip } from '../common/Botanicals';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onMarkAsRead,
  onBack,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [displayCount, setDisplayCount] = useState<number>(10);

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

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const displayedList = filtered.slice(0, displayCount);
  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Return button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-serif text-[#666747] hover:text-[#44352F] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to sanctuary</span>
        </button>
      </div>

      {/* Stationery Header */}
      <div className="relative bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-10 shadow-lg mb-8 text-center overflow-hidden card-paper">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none">
          <WashiTapeStrip color="#F7DDE1" width="w-32" rotation="-rotate-1" />
        </div>

        <div className="inline-flex p-3 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] mb-3">
          <TeacupIcon className="w-6 h-6 text-[#B98289]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#44352F]">
          Quiet Whispers
        </h1>
        <p className="font-editorial italic text-sm sm:text-base text-[#666747] mt-1 max-w-md mx-auto">
          “Gentle echoes of human empathy, responses, and thoughtful connections left for you.”
        </p>

        {/* Controls Bar: Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-[#E9D9C9]/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#B98289] text-white font-medium shadow-2xs'
                  : 'bg-white text-[#44352F] border border-[#E9D9C9] hover:bg-[#FFF8F0]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#B98289] text-white font-medium shadow-2xs'
                  : 'bg-white text-[#44352F] border border-[#E9D9C9] hover:bg-[#FFF8F0]'
              }`}
            >
              Unread ({unreadTotal})
            </button>
          </div>

          {unreadTotal > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-serif text-[#666747] hover:text-[#B98289] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="p-8 text-center bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9]">
            <RefreshCw className="w-5 h-5 text-[#B98289] animate-spin mx-auto mb-2" />
            <p className="font-serif text-xs text-[#666747]">Fetching gentle whispers...</p>
          </div>
        )}

        {displayedList.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onNotificationClick(notif)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 hover:shadow-md ${
              notif.read
                ? 'bg-[#FFFCF8] border-[#E9D9C9] opacity-85'
                : 'bg-[#FFF8F0] border-[#D8A0A5] shadow-xs'
            }`}
          >
            {/* Left avatar or botanical icon */}
            <div className="relative shrink-0 mt-0.5">
              {notif.actorAvatar ? (
                <img
                  src={notif.actorAvatar}
                  alt={notif.actorPseudonym || 'Someone'}
                  className="w-10 h-10 rounded-full object-cover border border-[#D8A0A5]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white border border-[#E9D9C9] flex items-center justify-center shadow-2xs">
                  {getIcon(notif.type)}
                </div>
              )}
              {!notif.read && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B98289] rounded-full ring-2 ring-white" />
              )}
            </div>

            {/* Middle body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-serif font-bold text-sm text-[#44352F]">
                  {notif.actorPseudonym || notif.title}
                </span>
                <span className="text-xs text-[#666747] font-mono shrink-0">
                  {notif.timestamp}
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-[#44352F]/90 leading-relaxed">
                {notif.description}
              </p>
            </div>

            {/* Right status action */}
            {!notif.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notif.id);
                }}
                className="text-[11px] text-[#B98289] hover:underline font-serif shrink-0 cursor-pointer pt-1"
                title="Mark this whisper as read"
              >
                Mark read
              </button>
            )}
          </div>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 bg-[#FFFCF8] rounded-3xl border border-dashed border-[#E9D9C9]">
            <PressedFlower className="w-12 h-12 text-[#D8A0A5] mx-auto mb-3 opacity-60" />
            <h3 className="font-editorial text-2xl font-bold text-[#44352F]">
              All is peaceful and quiet here
            </h3>
            <p className="font-serif text-xs text-[#666747] mt-1 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'You have read all whispers in your pigeonhole.'
                : 'When someone appreciates or responds to your writings, their gentle whisper will appear here.'}
            </p>
          </div>
        )}

        {/* Load More Button if paginated items remain */}
        {filtered.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount((prev) => prev + 10)}
              className="px-6 py-2.5 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] text-xs font-serif text-[#44352F] hover:bg-white hover:border-[#B98289] transition-all cursor-pointer shadow-2xs"
            >
              Load more whispers ({filtered.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
