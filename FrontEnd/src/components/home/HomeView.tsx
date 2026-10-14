import React, { useState, useMemo } from 'react';
import { Story, Category, StoryIntent } from '../../types';
import { HeroSection } from './HeroSection';
import { HomeSidebar } from './HomeSidebar';
import { StoryCard } from '../story/StoryCard';
import { Sparkles, Feather, Filter } from 'lucide-react';
import { WashiTapeStrip } from '../common/Botanicals';

interface HomeViewProps {
  stories: Story[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onReaction: (
    storyId: string,
    reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport'
  ) => void;
  onWriteClick: () => void;
  onExploreClick: () => void;
  onWritePrompt: (promptText: string) => void;
  onOpenProfile: (pseudonym: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stories,
  onReadStory,
  onToggleSave,
  onReaction,
  onWriteClick,
  onExploreClick,
  onWritePrompt,
  onOpenProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedIntent, setSelectedIntent] = useState<StoryIntent | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  const categories: (Category | 'All')[] = [
    'All',
    'Relationships',
    'Family',
    'Friendship',
    'Loneliness',
    'College & Career',
    'Self-growth',
    'Healing',
    'Life',
  ];

  // Filter public stories
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      if (s.isPrivate) return false;
      if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
      if (selectedIntent && s.intent !== selectedIntent) return false;
      return true;
    });
  }, [stories, selectedCategory, selectedIntent]);

  // Featured story (e.g. story-1 or first matching)
  const featuredStory = filteredStories[0];
  const regularStories = filteredStories.slice(1, visibleCount + 1);
  const hasMore = visibleCount + 1 < filteredStories.length;

  return (
    <div className="animate-fadeIn">
      {/* 1. Main Hero Section (Reference A) */}
      <HeroSection onWriteClick={onWriteClick} onExploreClick={onExploreClick} />

      {/* 2. Main Content Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Feed & Featured (8 cols on desktop) */}
          <main className="lg:col-span-8 space-y-8">
            {/* Category Filter Scroll Strip */}
            <div className="bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-serif font-semibold text-[#666747] shrink-0 pl-1">
                  Shelves:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1 rounded-full text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#F7DDE1] text-[#B98289] font-bold border border-[#D8A0A5]'
                        : 'bg-[#FFF8F0] text-[#44352F] border border-[#E9D9C9] hover:bg-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Story of the Day (Reference A) */}
            {featuredStory && (
              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B98289]" />
                    <h2 className="font-editorial font-bold text-xl text-[#44352F]">
                      Featured Journal Excerpt
                    </h2>
                  </div>
                  <span className="font-note text-sm text-[#666747]">
                    read softly
                  </span>
                </div>

                <StoryCard
                  story={featuredStory}
                  onRead={onReadStory}
                  onToggleSave={onToggleSave}
                  onReaction={onReaction}
                  featured={true}
                  onOpenProfile={onOpenProfile}
                />
              </section>
            )}

            {/* Recent Stories Feed */}
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-[#E9D9C9] pb-3 px-1">
                <h2 className="font-editorial font-bold text-2xl text-[#44352F]">
                  Recent Whispers & Stories
                </h2>
                <span className="text-xs font-sans-clean text-[#666747]">
                  {filteredStories.length} letters on this shelf
                </span>
              </div>

              {regularStories.length > 0 ? (
                <div className="space-y-6">
                  {regularStories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onRead={onReadStory}
                      onToggleSave={onToggleSave}
                      onReaction={onReaction}
                      onOpenProfile={onOpenProfile}
                    />
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 3)}
                        className="px-6 py-2.5 rounded-full bg-[#FFFCF8] hover:bg-[#F7DDE1]/50 border border-[#D8A0A5] text-xs font-serif font-medium text-[#44352F] transition-all cursor-pointer shadow-2xs hover:shadow"
                      >
                        Unfold more letters...
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#FFFCF8] rounded-2xl border border-dashed border-[#E9D9C9]">
                  <p className="font-editorial text-lg text-[#44352F]">
                    No letters found in this category yet.
                  </p>
                  <p className="text-xs font-body text-[#666747] mt-1">
                    Be the first to leave a gentle mark on this page.
                  </p>
                  <button
                    onClick={onWriteClick}
                    className="mt-4 px-4 py-2 rounded-full bg-[#B98289] text-white text-xs font-serif hover:bg-[#A36C73] cursor-pointer"
                  >
                    Pencil a reflection
                  </button>
                </div>
              )}
            </section>
          </main>

          {/* Right Column: Editorial Sidebar (4 cols on desktop) */}
          <div className="lg:col-span-4">
            <HomeSidebar
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onSelectIntent={(intent) => setSelectedIntent(intent)}
              selectedIntent={selectedIntent}
              onWritePrompt={onWritePrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
