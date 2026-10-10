import React, { useState } from 'react';
import { Story } from '../../types';
import { Bookmark, MessageCircle, Heart, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { TeacupIcon, PressedFlower, WashiTapeStrip } from '../common/Botanicals';

interface StoryCardProps {
  story: Story;
  onRead: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onReaction: (storyId: string, reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport') => void;
  featured?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onRead,
  onToggleSave,
  onReaction,
  featured = false,
}) => {
  const [showWarningContent, setShowWarningContent] = useState(false);

  const totalReactions =
    story.reactions.hearYou +
    story.reactions.feltThisToo +
    story.reactions.thankYou +
    story.reactions.sendingSupport;

  const hasReacted = story.userReactions && story.userReactions.length > 0;

  return (
    <article
      className={`group relative bg-[#FFFCF8] border border-[#E9D9C9] rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${
        featured ? 'p-6 sm:p-8 border-[#D8A0A5]/60 bg-gradient-to-b from-[#FFFCF8] to-[#FFF8F0]' : 'p-5 sm:p-6'
      }`}
    >
      {/* Decorative Washi Tape on top */}
      <div className="absolute -top-1 left-8 sm:left-12 pointer-events-none z-10">
        <WashiTapeStrip
          color={featured ? '#F7DDE1' : '#E9D9C9'}
          width="w-20 sm:w-28"
          rotation={featured ? '-rotate-2' : 'rotate-1'}
        />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3 pt-2">
        <div className="flex items-center gap-2.5">
          <img
            src={story.authorAvatar}
            alt={story.authorPseudonym}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#D8A0A5]"
          />
          <div>
            <div className="text-xs font-serif font-semibold text-[#44352F] flex items-center gap-1.5">
              <span>{story.authorPseudonym}</span>
              <span className="text-[#B98289] font-normal text-[11px]">•</span>
              <span className="text-[11px] font-sans-clean font-normal text-[#666747]">
                {story.date}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-sans-clean px-2 py-0.5 rounded-full bg-[#FFF8F0] text-[#666747] border border-[#E9D9C9]">
                {story.category}
              </span>
              <span className="text-[10px] font-sans-clean text-[#666747] flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {story.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Bookmark Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(story.id);
          }}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            story.saved
              ? 'text-[#B98289] bg-[#F7DDE1]/60'
              : 'text-[#666747]/60 hover:text-[#B98289] hover:bg-[#F7DDE1]/30'
          }`}
          title={story.saved ? 'Remove from saved' : 'Save this letter'}
          aria-label="Save story"
        >
          <Bookmark className={`w-4 h-4 ${story.saved ? 'fill-[#B98289]' : ''}`} />
        </button>
      </div>

      {/* Content Warning if present */}
      {story.contentWarning && (
        <div className="mb-3 p-2.5 rounded-lg bg-[#F7DDE1]/30 border border-[#D8A0A5]/40 text-xs text-[#44352F]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-[#B98289]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sensitive Topic: {story.contentWarning}</span>
            </div>
            <button
              onClick={() => setShowWarningContent(!showWarningContent)}
              className="text-[11px] text-[#666747] hover:underline font-medium cursor-pointer"
            >
              {showWarningContent ? 'Hide preview' : 'View anyway'}
            </button>
          </div>
        </div>
      )}

      {/* Title & Excerpt */}
      {(!story.contentWarning || showWarningContent) && (
        <div className="mb-4">
          <h3
            onClick={() => onRead(story)}
            className={`font-editorial font-bold text-[#44352F] cursor-pointer hover:text-[#B98289] transition-colors leading-snug ${
              featured ? 'text-2xl sm:text-3xl mb-2' : 'text-xl sm:text-2xl mb-1.5'
            }`}
          >
            {story.title}
          </h3>
          <p className="font-body text-[#44352F]/90 text-sm sm:text-base leading-relaxed line-clamp-3">
            {story.excerpt}
          </p>
        </div>
      )}

      {story.contentWarning && !showWarningContent && (
        <div className="mb-4 py-6 text-center bg-[#FFF8F0]/50 rounded-xl border border-dashed border-[#E9D9C9]">
          <p className="font-note text-lg text-[#666747]">This letter contains gentle reflections on sensitive themes.</p>
          <button
            onClick={() => setShowWarningContent(true)}
            className="mt-2 text-xs font-sans-clean text-[#B98289] hover:underline font-semibold cursor-pointer"
          >
            Click to unfold this letter
          </button>
        </div>
      )}

      {/* Featured visual photo snippet if available */}
      {featured && story.image && (
        <div className="mb-4 rounded-xl overflow-hidden border border-[#E9D9C9] max-h-56 relative group/img">
          <img
            src={story.image}
            alt="Atmospheric reflection"
            className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-[#FFFCF8]/90 text-[11px] font-note text-[#666747] border border-[#E9D9C9]">
            A quiet moment captured
          </div>
        </div>
      )}

      {/* Card Footer: Reactions, Comments & Read Link */}
      <div className="pt-3 border-t border-[#E9D9C9]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Supportive Reaction Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReaction(story.id, 'hearYou');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              hasReacted
                ? 'bg-[#F7DDE1] text-[#B98289] font-medium'
                : 'bg-[#FFF8F0] hover:bg-[#F7DDE1]/40 text-[#666747] border border-[#E9D9C9]'
            }`}
            title="Send supportive whisper: I hear you"
          >
            <Heart className={`w-3.5 h-3.5 ${hasReacted ? 'fill-[#B98289]' : ''}`} />
            <span>{totalReactions} whispered</span>
          </button>

          <button
            onClick={() => onRead(story)}
            className="flex items-center gap-1 text-[#666747] hover:text-[#44352F] cursor-pointer"
            title="Read responses"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{story.commentsCount} replies</span>
          </button>
        </div>

        {/* Soft Pink "Read letter" link */}
        <button
          onClick={() => onRead(story)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7DDE1]/70 hover:bg-[#F7DDE1] text-[#B98289] font-serif font-semibold text-xs transition-all hover:scale-105 cursor-pointer shadow-2xs"
        >
          <span>Read letter</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </article>
  );
};
