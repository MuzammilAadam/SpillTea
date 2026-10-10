import React, { useState } from 'react';
import { TeacupIcon, PressedFlower, LavenderSprig, PaperClip, WashiTapeStrip } from '../common/Botanicals';
import { Compass, Sparkles, Heart, HelpCircle, Music, Book, ArrowRight } from 'lucide-react';
import { TRENDING_TAGS, PROMPTS } from '../../data/mockData';
import { Category, StoryIntent } from '../../types';

interface HomeSidebarProps {
  onSelectCategory: (category: Category) => void;
  onSelectIntent: (intent: StoryIntent | null) => void;
  selectedIntent: StoryIntent | null;
  onWritePrompt: (promptText: string) => void;
}

export const HomeSidebar: React.FC<HomeSidebarProps> = ({
  onSelectCategory,
  onSelectIntent,
  selectedIntent,
  onWritePrompt,
}) => {
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  const handleNextPrompt = () => {
    setCurrentPromptIdx((prev) => (prev + 1) % PROMPTS.length);
  };

  return (
    <aside className="space-y-6">
      {/* 1. "A little about SpillTea" Vintage Intro Card */}
      <div className="relative bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-6 shadow-sm overflow-hidden">
        {/* Washi tape on top */}
        <div className="absolute -top-1 right-8 pointer-events-none">
          <WashiTapeStrip color="#B7B99A" width="w-24" rotation="rotate-2" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-[#F7DDE1]/50 text-[#B98289]">
            <TeacupIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial font-bold text-lg text-[#44352F]">
              A little about SpillTea
            </h3>
            <p className="font-note text-xs text-[#666747]">our humble philosophy</p>
          </div>
        </div>

        <p className="font-body text-xs sm:text-sm text-[#44352F]/85 leading-relaxed mb-3">
          We believe everyone carries words they couldn’t say out loud. Here, there are no follower counts, blue checkmarks, or vanity metrics—only an open table with warm tea and gentle souls.
        </p>

        <div className="pt-2 border-t border-[#E9D9C9] flex items-center justify-between text-xs font-serif text-[#666747]">
          <span>Anonymous by design</span>
          <span className="font-note text-sm text-[#B98289]">~ Est. 2026</span>
        </div>
      </div>

      {/* 2. "What do you need today?" Interactive Intent Card */}
      <div className="bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-editorial font-bold text-lg text-[#44352F]">
            What do you need today?
          </h3>
          <Sparkles className="w-4 h-4 text-[#B98289]" />
        </div>
        <p className="text-xs font-body text-[#666747] mb-4">
          Filter the journal by what authors are seeking:
        </p>

        <div className="grid grid-cols-1 gap-2 text-xs font-sans-clean">
          <button
            onClick={() => onSelectIntent(selectedIntent === 'vent' ? null : 'vent')}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
              selectedIntent === 'vent'
                ? 'bg-[#F7DDE1] border-[#B98289] text-[#44352F] font-semibold'
                : 'bg-[#FFF8F0] border-[#E9D9C9] hover:bg-[#F7DDE1]/40 text-[#44352F]'
            }`}
          >
            <span>“I just want to vent without advice”</span>
            <span className="text-[10px] text-[#B98289]">Unburden</span>
          </button>

          <button
            onClick={() => onSelectIntent(selectedIntent === 'advice' ? null : 'advice')}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
              selectedIntent === 'advice'
                ? 'bg-[#F7DDE1] border-[#B98289] text-[#44352F] font-semibold'
                : 'bg-[#FFF8F0] border-[#E9D9C9] hover:bg-[#F7DDE1]/40 text-[#44352F]'
            }`}
          >
            <span>“I would appreciate gentle advice”</span>
            <span className="text-[10px] text-[#666747]">Guidance</span>
          </button>

          <button
            onClick={() =>
              onSelectIntent(selectedIntent === 'similar_experiences' ? null : 'similar_experiences')
            }
            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
              selectedIntent === 'similar_experiences'
                ? 'bg-[#F7DDE1] border-[#B98289] text-[#44352F] font-semibold'
                : 'bg-[#FFF8F0] border-[#E9D9C9] hover:bg-[#F7DDE1]/40 text-[#44352F]'
            }`}
          >
            <span>“I'd like to hear similar experiences”</span>
            <span className="text-[10px] text-[#B98289]">Companionship</span>
          </button>

          {selectedIntent && (
            <button
              onClick={() => onSelectIntent(null)}
              className="text-center text-[11px] text-[#B98289] hover:underline pt-1 cursor-pointer"
            >
              Clear intent filter
            </button>
          )}
        </div>
      </div>

      {/* 3. Daily Reflection Prompt Card */}
      <div className="relative bg-[#FFF8F0] rounded-2xl border border-[#D8A0A5]/50 p-6 shadow-sm overflow-hidden">
        {/* Paper clip icon in top right */}
        <div className="absolute top-2 right-3">
          <PaperClip className="w-5 h-7 text-[#D8A0A5]" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-sans-clean font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7DDE1] text-[#B98289]">
            Today’s Prompt
          </span>
        </div>

        <p className="font-editorial text-lg italic text-[#44352F] font-medium leading-snug mb-4">
          “{PROMPTS[currentPromptIdx]}”
        </p>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E9D9C9]">
          <button
            onClick={handleNextPrompt}
            className="text-[11px] font-body text-[#666747] hover:text-[#B98289] cursor-pointer"
          >
            Another prompt →
          </button>

          <button
            onClick={() => onWritePrompt(PROMPTS[currentPromptIdx])}
            className="inline-flex items-center gap-1 font-serif text-[#B98289] font-medium hover:underline cursor-pointer"
          >
            <span>Answer privately</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Trending Topics paper tags */}
      <div className="bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-6 shadow-sm">
        <h3 className="font-editorial font-bold text-lg text-[#44352F] mb-3">
          Trending Tagged Shelves
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-[#FFF8F0] hover:bg-[#F7DDE1]/50 border border-[#E9D9C9] text-xs font-note text-[#44352F] transition-colors cursor-pointer select-none"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 5. Currently Listening / Reading Diary Snippet (Reference A) */}
      <div className="bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-5 shadow-xs text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E9D9C9] pb-2">
          <span className="font-note text-sm text-[#B98289]">on our desk right now</span>
          <LavenderSprig className="w-4 h-6 text-[#B98289]" />
        </div>
        <div className="flex items-center gap-2.5 text-[#44352F]">
          <Music className="w-3.5 h-3.5 text-[#666747] shrink-0" />
          <span className="font-body italic text-xs">Listening: “Autumn Breeze” by Ichiko Aoba</span>
        </div>
        <div className="flex items-center gap-2.5 text-[#44352F]">
          <Book className="w-3.5 h-3.5 text-[#666747] shrink-0" />
          <span className="font-body italic text-xs">Reading: “Letters to a Young Poet” by Rilke</span>
        </div>
      </div>

      {/* 6. Small Comforting Handwritten Note Card */}
      <div className="relative bg-[#FFF8F0] rounded-xl border border-dashed border-[#B98289]/40 p-5 text-center transform -rotate-1 shadow-2xs">
        <PressedFlower className="w-6 h-6 text-[#D8A0A5] mx-auto mb-2" />
        <p className="font-note text-lg text-[#44352F] leading-snug">
          “Breathe. You do not have to carry everything all at once. Put down what hurts for just five minutes.”
        </p>
        <span className="block mt-2 text-[10px] font-sans-clean text-[#666747]">
          — A whisper from a friend
        </span>
      </div>
    </aside>
  );
};
