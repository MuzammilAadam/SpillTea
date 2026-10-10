import React from 'react';
import { TeacupIcon, PressedFlower, OliveBranch } from '../common/Botanicals';
import { Heart, ShieldCheck, Mail, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenSupport: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupport }) => {
  return (
    <footer className="mt-20 border-t border-[#E9D9C9] bg-[#FFFCF8] text-[#44352F] relative overflow-hidden">
      {/* Subtle paper grain texture */}
      <div className="absolute top-0 right-10 opacity-30 pointer-events-none">
        <OliveBranch className="w-36 h-14 text-[#666747]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <TeacupIcon className="w-5 h-5 text-[#B98289]" />
              <span className="font-editorial text-2xl font-bold tracking-tight">SpillTea</span>
            </div>
            <p className="font-editorial italic text-base text-[#666747] max-w-md">
              “Some things are easier to say here. Your story deserves a little space without judgment, expectation, or pretense.”
            </p>
            <p className="text-xs font-body text-[#666747]/80 leading-relaxed max-w-sm">
              An anonymous emotional support journal created for heartfelt connection. While this frontend prototype protects your pseudonym, please remember to keep personal identifying information out of your letters.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#B98289]">
              <ShieldCheck className="w-4 h-4 text-[#666747]" />
              <span>No real names required • Safe peer space</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-editorial font-bold text-lg mb-3 text-[#44352F] border-b border-[#F7DDE1] pb-1 inline-block">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-sm font-body text-[#666747]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Homepage Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Explore Reflections
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('unsent-letters')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Unsent Letters Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('write')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Pencil a Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Scrapbook Profile
                </button>
              </li>
            </ul>
          </div>

          {/* Care & Wellbeing */}
          <div>
            <h4 className="font-editorial font-bold text-lg mb-3 text-[#44352F] border-b border-[#F7DDE1] pb-1 inline-block">
              Care & Comfort
            </h4>
            <ul className="space-y-2 text-sm font-body text-[#666747]">
              <li>
                <button
                  onClick={onOpenSupport}
                  className="text-[#B98289] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-[#D8A0A5]" />
                  <span>Immediate Crisis Support</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('myspace')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  My Private Diary & Drafts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('saved')}
                  className="hover:text-[#B98289] transition-colors cursor-pointer"
                >
                  Bookmarked Letters
                </button>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] text-xs text-[#666747]">
                  <Sparkles className="w-3 h-3 text-[#B98289]" />
                  Gentle Local State Prototype
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#E9D9C9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666747] gap-3">
          <div className="flex items-center gap-1">
            <span>Penciled with warmth & care</span>
            <span>•</span>
            <span className="font-note text-sm text-[#B98289]">“A little less bottled up.”</span>
          </div>
          <div>
            <span>SpillTea © 2026 • Designed for genuine empathy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
