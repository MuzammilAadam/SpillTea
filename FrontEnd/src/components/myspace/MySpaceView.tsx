import React, { useState } from 'react';
import { Story, UnsentLetter, UserProfile, Draft } from '../../types';
import {
  Lock,
  BookOpen,
  Feather,
  Mail,
  Bookmark,
  Trash2,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TeacupIcon, PressedFlower, WashiTapeStrip, PaperClip } from '../common/Botanicals';

interface MySpaceViewProps {
  user: UserProfile;
  stories: Story[];
  letters: UnsentLetter[];
  onOpenStory: (story: Story) => void;
  onOpenLetter: (letter: UnsentLetter) => void;
  onWriteClick: () => void;
  onOpenSupport: () => void;
  onResetSession: () => void;
}

export const MySpaceView: React.FC<MySpaceViewProps> = ({
  user,
  stories,
  letters,
  onOpenStory,
  onOpenLetter,
  onWriteClick,
  onOpenSupport,
  onResetSession,
}) => {
  const [activeTab, setActiveTab] = useState<'diary' | 'letters' | 'settings'>('diary');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Private letters only
  const privateLetters = letters.filter((l) => l.isPrivate);
  const myStories = stories.filter((s) => s.isAuthor || s.authorPseudonym === user.pseudonym);

  // Read saved local draft if any
  const savedDraftRaw = localStorage.getItem('spilltea_draft');
  const savedDraft: Draft | null = savedDraftRaw ? JSON.parse(savedDraftRaw) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header Styled like a Personal Diary Desk */}
      <div className="relative bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-10 shadow-lg mb-8 overflow-hidden">
        <div className="absolute -top-1 left-16 pointer-events-none">
          <WashiTapeStrip color="#B7B99A" width="w-28" rotation="-rotate-2" />
        </div>
        <div className="absolute top-4 right-6 opacity-60 hidden sm:block pointer-events-none">
          <PaperClip className="w-6 h-8 text-[#D8A0A5]" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#B98289]" />
              <span className="font-editorial text-xs uppercase tracking-widest text-[#B98289] font-bold">
                Private Journal Drawer
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#44352F]">
              My Space & Personal Diary
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#666747] mt-1 max-w-lg leading-relaxed">
              Everything in this drawer belongs strictly to you. Private letters and unfinished drafts are never visible in the public stream.
            </p>
          </div>

          <button
            onClick={onWriteClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#B98289] text-white hover:bg-[#A36C73] text-xs font-serif font-medium transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Feather className="w-3.5 h-3.5 text-[#F7DDE1]" />
            <span>Open new blank page</span>
          </button>
        </div>

        {/* Navigation Tabs within My Space */}
        <div className="flex gap-6 mt-8 pt-4 border-t border-[#E9D9C9] text-xs font-serif">
          <button
            onClick={() => setActiveTab('diary')}
            className={`pb-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diary'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Stories & Drafts ({myStories.length + (savedDraft ? 1 : 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('letters')}
            className={`pb-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'letters'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Private Sealed Letters ({privateLetters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & Sanctuary Settings</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STORIES & DRAFTS */}
      {activeTab === 'diary' && (
        <div className="space-y-6">
          {/* Active Local Draft Section if present */}
          {savedDraft && (
            <div className="p-5 rounded-2xl bg-[#FFF8F0] border-2 border-dashed border-[#D8A0A5] shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-sans-clean px-2 py-0.5 rounded-full bg-[#F7DDE1] text-[#B98289] font-bold flex items-center gap-1">
                  <Feather className="w-3 h-3" /> Unfinished Draft in Progress
                </span>
                <span className="text-xs text-[#666747] font-mono">Last saved {savedDraft.lastSaved}</span>
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#44352F]">
                {savedDraft.title || 'Untitled Draft'}
              </h3>
              <p className="font-body text-xs text-[#44352F]/80 line-clamp-2 mt-1">
                {savedDraft.content}
              </p>
              <div className="mt-4 pt-2 border-t border-[#E9D9C9] flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    localStorage.removeItem('spilltea_draft');
                    window.location.reload();
                  }}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Discard draft
                </button>
                <button
                  onClick={onWriteClick}
                  className="px-3 py-1.5 rounded-lg bg-[#B7B99A] text-white hover:bg-[#666747] transition-colors cursor-pointer font-serif"
                >
                  Resume writing →
                </button>
              </div>
            </div>
          )}

          {/* Published Stories */}
          <div className="space-y-4">
            <h3 className="font-editorial font-bold text-xl text-[#44352F]">
              My Shared Public Stories
            </h3>
            {myStories.length > 0 ? (
              myStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onOpenStory(story)}
                  className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] hover:border-[#D8A0A5] transition-all cursor-pointer shadow-xs flex justify-between items-center"
                >
                  <div>
                    <div className="text-xs text-[#666747] font-sans-clean mb-1">
                      {story.date} • {story.category}
                    </div>
                    <h4 className="font-editorial font-bold text-lg text-[#44352F]">
                      {story.title}
                    </h4>
                    <span className="text-xs text-[#B98289] font-serif">
                      {story.reactions.hearYou + story.reactions.feltThisToo} gentle whispers received
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#666747]" />
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-[#FFFCF8] rounded-2xl border border-dashed border-[#E9D9C9]">
                <p className="font-editorial text-base text-[#666747]">
                  No public stories published under your pen name yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRIVATE SEALED LETTERS */}
      {activeTab === 'letters' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#F7DDE1]/40 border border-[#D8A0A5]/40 text-xs text-[#44352F] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#B98289] shrink-0" />
            <span>These letters are locked inside your personal cedar box. No other user can view them.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {privateLetters.map((letter) => (
              <div
                key={letter.id}
                onClick={() => onOpenLetter(letter)}
                className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] hover:border-[#B98289] transition-all cursor-pointer shadow-xs relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7DDE1] text-[#B98289] font-serif">
                    {letter.category}
                  </span>
                  <Lock className="w-3 h-3 text-[#B98289]" />
                </div>
                <h4 className="font-editorial font-bold text-lg text-[#44352F]">
                  {letter.title}
                </h4>
                <p className="font-body text-xs text-[#666747] line-clamp-2 mt-1">
                  {letter.content}
                </p>
                <div className="mt-4 pt-2 border-t border-[#E9D9C9] text-[11px] text-[#666747] flex justify-between">
                  <span>To: {letter.recipient}</span>
                  <span className="text-[#B98289] font-medium">Unfold →</span>
                </div>
              </div>
            ))}
          </div>

          {privateLetters.length === 0 && (
            <div className="text-center py-12 bg-[#FFFCF8] rounded-2xl border border-dashed border-[#E9D9C9]">
              <Mail className="w-8 h-8 text-[#B98289] mx-auto mb-2 opacity-50" />
              <p className="font-editorial text-lg text-[#44352F]">No private letters sealed yet</p>
              <button
                onClick={onWriteClick}
                className="mt-3 px-4 py-2 rounded-full bg-[#B7B99A] text-white text-xs font-serif hover:bg-[#666747] cursor-pointer"
              >
                Write a private unsent letter
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRIVACY & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6 text-xs font-sans-clean">
          <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs space-y-4">
            <h3 className="font-editorial font-bold text-xl text-[#44352F]">
              Anonymous Identity & Privacy
            </h3>
            <p className="text-[#666747] leading-relaxed">
              SpillTea never requires your legal name, physical address, or contact phone. Your sessions exist in encrypted local storage on your device.
            </p>
            <div className="p-3 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9] text-xs">
              <strong>Current Pen Name:</strong> @{user.pseudonym} (Display: {user.displayName})
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs space-y-4">
            <h3 className="font-editorial font-bold text-xl text-[#44352F]">
              Urgent Emotional Wellbeing
            </h3>
            <p className="text-[#666747]">
              Need human support right now? Reach out to compassionate counselors free of charge:
            </p>
            <button
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7DDE1] text-[#B98289] font-serif font-semibold hover:bg-[#FFFCF8] border border-[#D8A0A5] cursor-pointer transition-all"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Open Crisis Helpline Directory</span>
            </button>
          </div>

          {/* Account reset / data purge prototype */}
          <div className="p-6 rounded-2xl bg-red-50/50 border border-red-200 shadow-xs space-y-3">
            <h3 className="font-editorial font-bold text-xl text-red-900">
              Clear Local Session & Scratchpad
            </h3>
            <p className="text-red-700">
              Prototype control: Safely resets your local browser state, drafts, and temporary letters back to fresh defaults.
            </p>

            {confirmResetOpen ? (
              <div className="p-3 bg-white rounded-xl border border-red-200 space-y-2">
                <p className="font-semibold text-red-800">
                  Reset local prototype data?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmResetOpen(false)}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onResetSession}
                    className="px-3 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
                  >
                    Yes, reset data
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmResetOpen(true)}
                className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-100/50 font-serif cursor-pointer transition-colors"
              >
                Reset Local Prototype Data
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
