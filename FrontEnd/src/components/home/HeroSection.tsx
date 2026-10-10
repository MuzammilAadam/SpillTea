import React from 'react';
import { Feather, BookOpen, Heart, Sparkles } from 'lucide-react';
import { TeacupIcon, PressedFlower, OliveBranch, WashiTapeStrip } from '../common/Botanicals';

interface HeroSectionProps {
  onWriteClick: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onWriteClick, onExploreClick }) => {
  return (
    <section className="relative text-center py-10 sm:py-16 px-4 max-w-4xl mx-auto overflow-hidden">
      {/* Decorative botanical accents around the hero */}
      <div className="absolute top-2 left-4 sm:left-12 opacity-80 pointer-events-none hidden sm:block">
        <OliveBranch className="w-16 h-8 text-[#666747]" />
      </div>
      <div className="absolute top-3 right-6 sm:right-16 opacity-75 pointer-events-none hidden sm:block">
        <PressedFlower className="w-10 h-10 text-[#D8A0A5]" />
      </div>

      {/* Decorative Washi Tape badge */}
      <div className="inline-block relative mb-4">
        <WashiTapeStrip color="#F7DDE1" width="w-32" rotation="-rotate-2" className="mx-auto" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFCF8] text-xs font-serif text-[#666747] border border-[#E9D9C9] shadow-2xs mt-1">
          <Sparkles className="w-3 h-3 text-[#B98289]" />
          An anonymous journal for quiet hearts
        </span>
      </div>

      {/* Large Title with Handwritten Aesthetics */}
      <div className="relative inline-block mb-3">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-editorial font-bold text-[#44352F] tracking-tight leading-none">
          Spill<span className="font-handwriting text-6xl sm:text-8xl lg:text-9xl text-[#B98289] font-normal ml-1">Tea</span>
        </h1>
        <div className="absolute -top-3 -right-6 sm:-top-5 sm:-right-8 text-[#D8A0A5] transform rotate-12">
          <TeacupIcon className="w-7 h-7 sm:w-9 sm:h-9" />
        </div>
      </div>

      {/* Emotional Tagline */}
      <p className="font-editorial italic text-2xl sm:text-3xl text-[#B98289] font-medium mb-3">
        “Some things are easier to say here.”
      </p>

      {/* Supporting Text */}
      <p className="font-body text-sm sm:text-base text-[#44352F]/85 max-w-xl mx-auto leading-relaxed mb-8">
        A gentle, unhurried space where you can anonymously pour out heavy feelings, secret joys, unspoken goodbyes, and midnight reflections. No followers, no popularity contests—just honest human hearts listening.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onWriteClick}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#B98289] text-[#FFF8F0] hover:bg-[#A36C73] transition-all text-sm sm:text-base font-serif font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          <Feather className="w-4 h-4 text-[#F7DDE1]" />
          <span>Spill your tea</span>
        </button>

        <button
          onClick={onExploreClick}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFFCF8] text-[#44352F] hover:bg-[#FFF8F0] border border-[#D8A0A5] transition-all text-sm sm:text-base font-serif font-medium shadow-xs hover:shadow cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#666747]" />
          <span>Read others’ stories</span>
        </button>
      </div>

      {/* Comforting Microcopy */}
      <p className="text-xs font-note text-[#666747] mt-4 tracking-wider">
        * Always anonymous • Your words belong to you • Safe to breathe
      </p>
    </section>
  );
};
