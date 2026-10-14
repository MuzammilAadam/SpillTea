import React, { useState, useEffect } from 'react';
import { Category, StoryIntent, Mood, Story, UnsentLetter, LetterCategory } from '../../types';
import { Feather, Save, Eye, Send, Lock, Globe, Sparkles, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { TeacupIcon, PressedFlower, OliveBranch, WashiTapeStrip, PaperClip, WaxSeal } from '../common/Botanicals';
import { useAuth } from '../../context/AuthContext';

interface WriteLetterViewProps {
  onPublishStory: (newStory: Omit<Story, 'id' | 'reactions' | 'userReactions' | 'commentsCount' | 'saved' | 'comments'>) => void;
  onSaveDraft: (draftData: any) => void;
  onPublishLetter: (letterData: Omit<UnsentLetter, 'id' | 'date'>) => void;
  initialPrompt?: string | null;
  onCancel: () => void;
}

export const WriteLetterView: React.FC<WriteLetterViewProps> = ({
  onPublishStory,
  onSaveDraft,
  onPublishLetter,
  initialPrompt,
  onCancel,
}) => {
  const { isAuthenticated } = useAuth();
  // Mode: regular story vs unsent letter
  const [mode, setMode] = useState<'story' | 'unsent'>('story');

  // Form State
  const [title, setTitle] = useState(initialPrompt ? `Reflection: ${initialPrompt.slice(0, 45)}...` : '');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('Life');
  const [letterCategory, setLetterCategory] = useState<LetterCategory>('To My Younger Self');
  const [recipient, setRecipient] = useState('');
  const [mood, setMood] = useState<Mood>('reflective');
  const [intent, setIntent] = useState<StoryIntent>('vent');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasContentWarning, setHasContentWarning] = useState(false);
  const [contentWarningText, setContentWarningText] = useState('');
  
  // UI states
  const [isPreview, setIsPreview] = useState(false);
  const [savedDraftAlert, setSavedDraftAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Character count & estimated read time
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

  // Auto-load draft from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('spilltea_draft');
    if (saved && !content && !initialPrompt) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.content) setContent(parsed.content);
        if (parsed.category) setCategory(parsed.category);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = {
      title,
      content,
      category,
      letterCategory,
      mood,
      intent,
      isPrivate,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem('spilltea_draft', JSON.stringify(draft));
    onSaveDraft(draft);
    setSavedDraftAlert(true);
    setTimeout(() => setSavedDraftAlert(false), 2500);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please write a title for your letter.');
      return;
    }
    if (!content.trim() || content.trim().length < 20) {
      setErrorMsg('Please write a little more before releasing your letter (at least 20 characters).');
      return;
    }

    // Always preserve current draft before publish attempt
    const draft = {
      title: title.trim(),
      content: content.trim(),
      category: mode === 'story' ? category : letterCategory,
      letterCategory,
      mood,
      intent,
      isPrivate,
    };
    localStorage.setItem('spilltea_draft', JSON.stringify(draft));

    if (mode === 'unsent') {
      onPublishLetter({
        recipient: recipient.trim() || letterCategory,
        title: title.trim(),
        content: content.trim(),
        category: letterCategory,
        isPrivate: isPrivate,
        envelopeColor: letterCategory === 'To My Younger Self' ? '#F7DDE1' : '#FFF8F0',
        stampStyle: 'botanical-rose',
        washiColor: '#B7B99A',
        authorPseudonym: isAnonymous ? 'Anonymous' : 'TeaAndWildflowers',
      });
      if (isAuthenticated) {
        localStorage.removeItem('spilltea_draft');
      }
    } else {
      onPublishStory({
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().slice(0, 160) + (content.length > 160 ? '...' : ''),
        authorPseudonym: isAnonymous ? 'Anonymous' : 'TeaAndWildflowers',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        category: category,
        tags: [category.toLowerCase().replace(/\s+/g, '-'), mood],
        intent: intent,
        contentWarning: hasContentWarning && contentWarningText.trim() ? contentWarningText.trim() : undefined,
        readTime: readTime,
        isPrivate: isPrivate,
      });
      if (isAuthenticated) {
        localStorage.removeItem('spilltea_draft');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Back button and quick banner */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-serif text-[#666747] hover:text-[#44352F] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to sanctuary</span>
        </button>

        {/* Mode switcher: Story vs Unsent Letter with smooth transitions */}
        <div className="flex rounded-full bg-[#E9D9C9]/50 p-1 border border-[#E9D9C9] text-xs transition-all">
          <button
            type="button"
            onClick={() => setMode('story')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
              mode === 'story'
                ? 'bg-white text-[#44352F] shadow-xs'
                : 'text-[#666747] hover:text-[#44352F]'
            }`}
          >
            Spill a Story
          </button>
          <button
            type="button"
            onClick={() => setMode('unsent')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
              mode === 'unsent'
                ? 'bg-white text-[#44352F] shadow-xs'
                : 'text-[#666747] hover:text-[#44352F]'
            }`}
          >
            Unsent Letter Mode
          </button>
        </div>
      </div>

      {/* Writing Desk Container */}
      <div className="relative bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-12 shadow-xl overflow-hidden card-paper animate-slide-up" style={{ animationDuration: '450ms' }}>
        {/* Decorative Washi Tape & Stationery Accents */}
        <div className="absolute -top-1 left-12 pointer-events-none">
          <WashiTapeStrip color="#F7DDE1" width="w-32" rotation="-rotate-1" />
        </div>
        <div className="absolute -top-1 right-16 pointer-events-none">
          <WashiTapeStrip color="#B7B99A" width="w-24" rotation="rotate-2" />
        </div>
        <div className="absolute top-6 right-6 opacity-60 hidden sm:block pointer-events-none animate-float-drift">
          <PressedFlower className="w-8 h-8 text-[#D8A0A5]" />
        </div>
        {/* Animated pen & paper clip stationery accents */}
        <div className="absolute top-6 left-6 opacity-40 hidden sm:flex items-center gap-2 pointer-events-none">
          <Feather className="w-5 h-5 text-[#B98289] animate-float-slow" />
          <PaperClip className="w-4 h-6 text-[#666747]" />
        </div>

        {/* Page Title & Calming Subtitle */}
        <div className="text-center mb-8 pt-2 animate-fadeIn" style={{ animationDuration: '600ms' }}>
          <h1 className="font-handwriting text-5xl sm:text-6xl text-[#B98289] font-normal">
            Let it out.
          </h1>
          <p className="font-editorial italic text-base sm:text-lg text-[#666747] mt-1">
            “Take your time. There is no perfect way to say it.”
          </p>
        </div>

        {/* Validation Error Message */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-[#F7DDE1] border border-[#B98289] text-xs text-[#44352F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#B98289] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handlePublish} className="space-y-6">
          {/* Unsent Letter Recipient bar */}
          {mode === 'unsent' && (
            <div className="p-4 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-serif font-semibold text-[#44352F]">
                  Who is this letter addressed to?
                </label>
                <div className="flex gap-2">
                  {(['To My Younger Self', 'Someone I Miss', 'Things I Never Said', 'Letters to the Future'] as LetterCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setLetterCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          letterCategory === cat
                            ? 'bg-[#B98289] text-white border-[#B98289]'
                            : 'bg-white text-[#666747] border-[#E9D9C9] hover:bg-[#F7DDE1]/30'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="E.g., To my former best friend, To myself at sixteen, To the stranger on train 4..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
              />
            </div>
          )}

          {/* Letter Title */}
          <div>
            <label className="block text-xs font-serif font-semibold text-[#666747] mb-1.5 uppercase tracking-wider">
              Title / First Thought
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'unsent' ? "Dear someone..." : "What's been on your mind?"}
              className="w-full px-4 py-3 text-lg sm:text-xl font-editorial font-bold text-[#44352F] bg-[#FFF8F0]/80 rounded-xl border border-[#E9D9C9] focus:outline-none focus:border-[#B98289] focus:bg-white transition-all placeholder-[#666747]/40"
            />
          </div>

          {/* Writing Area with subtle ruled lines or warm paper feel */}
          <div className="relative">
            <label className="block text-xs font-serif font-semibold text-[#666747] mb-1.5 uppercase tracking-wider flex justify-between">
              <span>Your Words</span>
              <span className="font-mono text-[11px] text-[#666747]">
                {charCount} characters • {wordCount} words • ~{readTime}
              </span>
            </label>

            {!isPreview ? (
              <div className="relative rounded-2xl border border-[#E9D9C9] bg-[#FFFCF8] p-4 sm:p-6 shadow-inner">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start wherever you need to. You don't have to make it perfect. Spill the messy parts, the quiet parts, the things you swallow before smiling..."
                  rows={14}
                  className="w-full text-base sm:text-lg font-body leading-relaxed text-[#44352F] bg-transparent border-none focus:outline-none resize-y placeholder-[#666747]/40"
                />
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl border border-[#D8A0A5] bg-[#FFF8F0] space-y-4">
                <div className="text-xs font-note text-[#B98289]">Letter Preview</div>
                <h3 className="font-editorial text-2xl font-bold text-[#44352F]">{title || 'Untitled Letter'}</h3>
                <div className="font-body text-base text-[#44352F] whitespace-pre-line leading-relaxed">
                  {content || 'No words entered yet.'}
                </div>
              </div>
            )}
          </div>

          {/* Selectors Bar: Category, Mood, Intent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFF8F0] border border-[#E9D9C9] text-xs">
            {/* Category */}
            <div>
              <label className="block font-medium text-[#44352F] mb-1">Topic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-2 rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
              >
                <option value="Relationships">Relationships</option>
                <option value="Family">Family</option>
                <option value="Friendship">Friendship</option>
                <option value="Loneliness">Loneliness</option>
                <option value="College & Career">College & Career</option>
                <option value="Self-growth">Self-growth</option>
                <option value="Healing">Healing</option>
                <option value="Life">Life</option>
                <option value="Unsent Letters">Unsent Letters</option>
              </select>
            </div>

            {/* Mood */}
            <div>
              <label className="block font-medium text-[#44352F] mb-1">Current Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as Mood)}
                className="w-full p-2 rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
              >
                <option value="reflective">Reflective & Quiet</option>
                <option value="melancholy">Melancholic & Heavy</option>
                <option value="hopeful">Softly Hopeful</option>
                <option value="overwhelmed">Overwhelmed & Tired</option>
                <option value="peaceful">Peaceful Acceptance</option>
                <option value="tender">Tender & Vulnerable</option>
              </select>
            </div>

            {/* Intent */}
            <div>
              <label className="block font-medium text-[#44352F] mb-1">What do you need?</label>
              <select
                value={intent}
                onChange={(e) => setIntent(e.target.value as StoryIntent)}
                className="w-full p-2 rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
              >
                <option value="vent">I just want to vent (no advice)</option>
                <option value="advice">I would appreciate advice</option>
                <option value="similar_experiences">I'd like to hear similar experiences</option>
              </select>
            </div>
          </div>

          {/* Privacy & Sensitivity Toggles */}
          <div className="space-y-3 p-4 rounded-xl bg-[#FFFCF8] border border-[#E9D9C9] text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Anonymous vs Pseudonym */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-[#B98289] focus:ring-[#B98289]"
                />
                <span className="text-[#44352F] font-medium">
                  Publish completely as "Anonymous" (hides @TeaAndWildflowers)
                </span>
              </label>

              {/* Private Drawer vs Public Feed */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded text-[#B98289] focus:ring-[#B98289]"
                />
                <span className="text-[#666747] font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#B98289]" />
                  Keep strictly private (saves to My Space drawer only)
                </span>
              </label>
            </div>

            {/* Content Warning Option */}
            <div className="pt-2 border-t border-[#E9D9C9]/60">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={hasContentWarning}
                  onChange={(e) => setHasContentWarning(e.target.checked)}
                  className="rounded text-[#B98289] focus:ring-[#B98289]"
                />
                <span className="text-[#44352F] font-medium">
                  Add content warning for sensitive themes (grief, trauma, loss, etc.)
                </span>
              </label>

              {hasContentWarning && (
                <input
                  type="text"
                  value={contentWarningText}
                  onChange={(e) => setContentWarningText(e.target.value)}
                  placeholder="Specify brief warning label, e.g. 'Grief & Loss' or 'Family conflict'..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
                />
              )}
            </div>
          </div>

          {/* Action Buttons: Preview, Save Draft, Publish */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E9D9C9]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E9D9C9] bg-[#FFF8F0] hover:bg-white text-xs font-serif text-[#44352F] transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#666747]" />
                <span>{isPreview ? 'Edit writing' : 'Preview letter'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E9D9C9] bg-[#FFF8F0] hover:bg-white text-xs font-serif text-[#44352F] transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#B98289]" />
                <span>Save to draft</span>
              </button>

              {savedDraftAlert && (
                <span className="text-xs text-[#666747] font-note flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#B7B99A]" /> Saved in drawer!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B98289] hover:bg-[#A36C73] text-[#FFF8F0] font-serif font-medium text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#F7DDE1]" />
                <span>{isPrivate ? 'Seal in Private Drawer' : (mode === 'unsent' ? 'Send into the Ether' : 'Spill your tea')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
