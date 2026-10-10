import React, { useState, useMemo } from 'react';
import { Story, Category } from '../../types';
import { Search, Filter, Sparkles, BookOpen, Clock, MessageSquare, Compass, ArrowUpDown } from 'lucide-react';
import { StoryCard } from '../story/StoryCard';
import { TeacupIcon, PressedFlower, WashiTapeStrip } from '../common/Botanicals';

interface ExploreViewProps {
  stories: Story[];
  onReadStory: (story: Story) => void;
  onToggleSave: (storyId: string) => void;
  onReaction: (storyId: string, reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport') => void;
  initialSearchQuery?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  stories,
  onReadStory,
  onToggleSave,
  onReaction,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'discussion'>('newest');

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

  const collections = [
    { title: 'Late Night Solace', desc: 'Stories penned between midnight and dawn', tag: 'exhaustion' },
    { title: 'Healing in Silence', desc: 'Putting down the burden of having to be strong', tag: 'healing' },
    { title: 'Unspoken Goodbyes', desc: 'Friendships and bonds that drifted quietly', tag: 'friendship-grief' },
  ];

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Category filter
      if (selectedCategory !== 'All' && story.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = story.title.toLowerCase().includes(q);
        const matchesExcerpt = story.excerpt.toLowerCase().includes(q);
        const matchesContent = story.content.toLowerCase().includes(q);
        const matchesTag = story.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesContent && !matchesTag) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'discussion') {
        return (b.commentsCount || 0) - (a.commentsCount || 0);
      }
      // default newest: mock order preserves newest first
      return 0;
    });
  }, [stories, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-block relative mb-2">
          <WashiTapeStrip color="#F7DDE1" width="w-24" rotation="rotate-1" className="mx-auto" />
          <span className="font-editorial text-xs uppercase tracking-widest text-[#B98289] font-semibold mt-1 inline-block">
            Quiet Discovery
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-[#44352F] tracking-tight">
          Explore Reflections
        </h1>
        <p className="font-body text-sm sm:text-base text-[#44352F]/80 mt-2 leading-relaxed">
          Find letters written by souls walking paths like yours. Search by honest thoughts, topics of grief and growth, or browse curated shelves.
        </p>
      </div>

      {/* Curated Shelves / Topic Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {collections.map((col, idx) => (
          <div
            key={idx}
            onClick={() => setSearchQuery(col.tag)}
            className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] hover:border-[#D8A0A5] transition-all cursor-pointer shadow-2xs hover:shadow-md relative overflow-hidden group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#B98289]" />
              <h3 className="font-editorial font-bold text-lg text-[#44352F] group-hover:text-[#B98289]">
                {col.title}
              </h3>
            </div>
            <p className="font-body text-xs text-[#666747] leading-relaxed">
              {col.desc}
            </p>
            <span className="block mt-3 text-[10px] font-sans-clean text-[#B98289] font-medium group-hover:underline">
              Browse shelf #{col.tag} →
            </span>
          </div>
        ))}
      </div>

      {/* Search Bar & Sort Controls */}
      <div className="bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-4 sm:p-6 mb-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98289]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, feelings, or tags..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] placeholder-[#666747]/60 focus:outline-none focus:border-[#B98289]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666747] hover:text-[#44352F]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 text-xs font-serif text-[#666747] self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#B98289]" />
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-[#B7B99A] text-white border-[#B7B99A] font-semibold'
                  : 'bg-white border-[#E9D9C9] text-[#44352F]'
              }`}
            >
              Latest entries
            </button>
            <button
              onClick={() => setSortBy('discussion')}
              className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                sortBy === 'discussion'
                  ? 'bg-[#B7B99A] text-white border-[#B7B99A] font-semibold'
                  : 'bg-white border-[#E9D9C9] text-[#44352F]'
              }`}
            >
              Recent conversations
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E9D9C9]/60">
          <span className="text-xs font-serif font-semibold text-[#666747] mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#F7DDE1] text-[#B98289] font-bold border border-[#D8A0A5]'
                  : 'bg-[#FFF8F0] text-[#666747] border border-[#E9D9C9] hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Results Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredStories.map((story) => (
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
        <div className="text-center py-20 bg-[#FFFCF8] rounded-3xl border border-dashed border-[#E9D9C9] p-8">
          <Compass className="w-10 h-10 text-[#B98289] mx-auto mb-3 opacity-60" />
          <h3 className="font-editorial text-2xl font-bold text-[#44352F]">
            No reflections match your search
          </h3>
          <p className="font-body text-xs sm:text-sm text-[#666747] mt-1 max-w-sm mx-auto">
            Try searching for a different feeling, or clear your filters to wander through all letters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-[#B7B99A] text-white text-xs font-serif hover:bg-[#666747] cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
