import React from 'react';
import { Story } from '../../types';
import { Bookmark, Compass, ArrowRight } from 'lucide-react';
import { StoryCard } from '../story/StoryCard';
import { WashiTapeStrip, TeacupIcon } from '../common/Botanicals';

interface SavedViewProps {
  stories: Story[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onReaction: (storyId: string, reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport') => void;
  onExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  stories,
  onReadStory,
  onToggleSave,
  onReaction,
  onExplore,
}) => {
  const savedStories = stories.filter((s) => s.saved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-block relative mb-2">
          <WashiTapeStrip color="#F7DDE1" width="w-24" rotation="-rotate-1" className="mx-auto" />
          <span className="font-editorial text-xs uppercase tracking-widest text-[#B98289] font-semibold mt-1 inline-block">
            Keepsakes
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-[#44352F] tracking-tight">
          Bookmarked Letters
        </h1>
        <p className="font-body text-sm sm:text-base text-[#44352F]/80 mt-2 leading-relaxed">
          Stories that resonated with your heart, saved quietly in your cedar chest to reread when nights get cold.
        </p>
      </div>

      {savedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {savedStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onRead={onReadStory}
              onToggleSave={onToggleSave}
              onReaction={onReaction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#FFFCF8] rounded-3xl border border-dashed border-[#E9D9C9] p-8 max-w-md mx-auto">
          <div className="p-3 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] inline-block mb-3">
            <Bookmark className="w-8 h-8 text-[#B98289] opacity-70" />
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#44352F]">
            Your Keepsake Chest is Empty
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#666747] mt-2 leading-relaxed">
            Whenever you read a story that touches your soul, click the bookmark icon to keep it nestled here.
          </p>
          <button
            onClick={onExplore}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#B7B99A] text-white text-xs font-serif hover:bg-[#666747] transition-all cursor-pointer shadow-xs"
          >
            <span>Explore stories to save</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
