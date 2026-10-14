import React, { useState } from 'react';
import { UnsentLetter, LetterCategory } from '../../types';
import { Mail, Plus, Lock, Globe, Trash2, X, Feather, Heart, Sparkles, Send } from 'lucide-react';
import { TeacupIcon, PressedFlower, WaxSeal, WashiTapeStrip, PaperClip } from '../common/Botanicals';

interface UnsentLettersViewProps {
  letters: UnsentLetter[];
  onOpenLetter?: (letter: UnsentLetter) => void;
  onNewLetter: () => void;
  onDeleteLetter: (letterId: string) => void;
  onReactLetter?: (letterId: string, type: string) => void;
  onReplyLetter?: (letterId: string, content: string) => void;
  initialLetterId?: string | null;
}

export const UnsentLettersView: React.FC<UnsentLettersViewProps> = ({
  letters,
  onOpenLetter,
  onNewLetter,
  onDeleteLetter,
  onReactLetter,
  onReplyLetter,
  initialLetterId,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeLetter, setActiveLetter] = useState<UnsentLetter | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reactedLocally, setReactedLocally] = useState<Record<string, boolean>>({});
  const [replySuccess, setReplySuccess] = useState(false);

  React.useEffect(() => {
    if (initialLetterId && letters.length > 0) {
      const found = letters.find((l) => l.id === initialLetterId);
      if (found) setActiveLetter(found);
    }
  }, [initialLetterId, letters]);

  const categories: (LetterCategory | 'All' | 'My Private')[] = [
    'All',
    'To My Younger Self',
    'Someone I Miss',
    'Things I Never Said',
    'Letters to the Future',
    'My Private',
  ];

  const filteredLetters = letters.filter((l) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'My Private') return l.isPrivate;
    return l.category === selectedFilter;
  });

  const handleDelete = (id: string) => {
    onDeleteLetter(id);
    setConfirmDeleteId(null);
    if (activeLetter?.id === id) {
      setActiveLetter(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Stationery Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-block relative mb-2">
          <WashiTapeStrip color="#B7B99A" width="w-28" rotation="-rotate-1" className="mx-auto" />
          <span className="font-editorial text-xs uppercase tracking-widest text-[#666747] font-semibold mt-1 inline-block">
            The Desk of Unsent Words
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-editorial font-bold text-[#44352F] tracking-tight">
          Unsent Letters
        </h1>
        <p className="font-body text-sm sm:text-base text-[#44352F]/80 mt-2 leading-relaxed">
          Folded letters to younger selves, ghosts of former lovers, departed grandparents, or futures not yet arrived. Keep them sealed in your private chest, or release them anonymously into the ether.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onNewLetter}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B98289] text-[#FFF8F0] hover:bg-[#A36C73] text-sm font-serif font-medium transition-all shadow-md hover:scale-105 cursor-pointer"
          >
            <Feather className="w-4 h-4 text-[#F7DDE1]" />
            <span>Pencil an Unsent Letter</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
              selectedFilter === cat
                ? 'bg-[#B7B99A] text-white font-semibold shadow-xs'
                : 'bg-[#FFFCF8] text-[#44352F] border border-[#E9D9C9] hover:bg-[#FFF8F0]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Vintage Envelopes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredLetters.map((letter, idx) => {
          const rotations = ['rotate-1', '-rotate-1', 'rotate-0', '-rotate-2', 'rotate-2'];
          const rotationClass = rotations[idx % rotations.length];

          return (
            <div
              key={letter.id}
              onClick={() => setActiveLetter(letter)}
              className={`group relative rounded-2xl border border-[#E9D9C9] p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform ${rotationClass} bg-[#FFFCF8] overflow-hidden`}
              style={{
                backgroundColor: letter.envelopeColor || '#FFF8F0',
              }}
            >
              {/* Envelope flap aesthetic */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-black/5 border-b border-black/5" />

              {/* Top Washi Tape */}
              <div className="absolute -top-1 left-8 pointer-events-none">
                <WashiTapeStrip
                  color={letter.washiColor || '#F7DDE1'}
                  width="w-20"
                  rotation="-rotate-2"
                />
              </div>

              {/* Postage Stamp & Wax Seal corner */}
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-sans-clean px-2 py-0.5 rounded-full bg-white/80 border border-[#E9D9C9] text-[#666747]">
                    {letter.category}
                  </span>
                  {letter.isPrivate ? (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E9D9C9]/80 text-[#666747]">
                      <Lock className="w-2.5 h-2.5 text-[#B98289]" />
                      Private
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#B7B99A]/30 text-[#666747]">
                      <Globe className="w-2.5 h-2.5 text-[#666747]" />
                      In Ether
                    </span>
                  )}
                </div>

                {/* Wax seal */}
                <WaxSeal className="w-8 h-8 text-[10px]" label="ST" />
              </div>

              {/* Recipient note */}
              <div className="mb-2">
                <span className="font-note text-sm text-[#B98289] block">
                  Addressed to: {letter.recipient}
                </span>
                <h3 className="font-editorial font-bold text-xl text-[#44352F] leading-snug group-hover:text-[#B98289] transition-colors">
                  {letter.title}
                </h3>
              </div>

              {/* Excerpt preview */}
              <p className="font-body text-xs text-[#44352F]/80 line-clamp-3 leading-relaxed mb-6">
                {letter.content}
              </p>

              {/* Bottom footer: date and unfold link */}
              <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-serif text-[#666747]">
                <span>{letter.date}</span>
                <span className="text-[#B98289] font-medium group-hover:underline flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Unfold letter
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLetters.length === 0 && (
        <div className="text-center py-16 bg-[#FFFCF8] rounded-2xl border border-dashed border-[#E9D9C9]">
          <Mail className="w-10 h-10 text-[#B98289] mx-auto mb-3 opacity-60" />
          <h3 className="font-editorial text-xl font-bold text-[#44352F]">No letters in this pigeonhole yet</h3>
          <p className="font-body text-xs text-[#666747] mt-1 max-w-sm mx-auto">
            Perhaps there are words lingering in your chest that are waiting to be quietly set down on paper.
          </p>
          <button
            onClick={onNewLetter}
            className="mt-4 px-4 py-2 rounded-full bg-[#B7B99A] text-white text-xs font-serif hover:bg-[#666747] cursor-pointer"
          >
            Pencil a letter now
          </button>
        </div>
      )}

      {/* Open Letter Modal with Unfolding Envelope Animation */}
      {activeLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Washi Tape top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none">
              <WashiTapeStrip color={activeLetter.washiColor || '#F7DDE1'} width="w-32" rotation="-rotate-1" />
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-[#E9D9C9]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans-clean px-2.5 py-0.5 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] text-[#666747]">
                  {activeLetter.category}
                </span>
                {activeLetter.isPrivate && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F7DDE1] text-[#B98289] font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Sealed in Private Drawer
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDeleteId(activeLetter.id)}
                  className="p-1.5 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                  title="Burn / Delete Letter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveLetter(null)}
                  className="p-1.5 rounded-full hover:bg-[#F7DDE1]/40 text-[#44352F] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Letter Reading Sheet */}
            <div className="overflow-y-auto py-6 space-y-6 flex-1 pr-2">
              <div className="text-center border-b border-dashed border-[#E9D9C9] pb-4">
                <span className="font-note text-lg text-[#B98289] block">
                  Addressed to: {activeLetter.recipient}
                </span>
                <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#44352F] mt-1">
                  {activeLetter.title}
                </h2>
                <div className="text-xs font-sans-clean text-[#666747] mt-1">
                  Penciled on {activeLetter.date} • by {activeLetter.authorPseudonym}
                </div>
              </div>

              <div className="text-base sm:text-lg font-body leading-relaxed text-[#44352F] whitespace-pre-line space-y-4 px-2">
                {activeLetter.content}
              </div>

              {/* Gentle Reaction & Thoughtful Response Section for Public/Ether Letters */}
              {!activeLetter.isPrivate && (
                <div className="mt-6 pt-5 border-t border-[#E9D9C9] space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const isReacted = reactedLocally[activeLetter.id];
                        setReactedLocally(prev => ({ ...prev, [activeLetter.id]: !isReacted }));
                        if (onReactLetter) {
                          onReactLetter(activeLetter.id, 'feltThisToo');
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                        reactedLocally[activeLetter.id]
                          ? 'bg-[#F7DDE1] text-[#B98289] border-[#D8A0A5] shadow-xs'
                          : 'bg-[#FFF8F0] hover:bg-[#F7DDE1]/40 text-[#666747] border-[#E9D9C9]'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          reactedLocally[activeLetter.id]
                            ? 'fill-[#B98289] text-[#B98289] animate-reaction-pop'
                            : 'text-[#B98289]'
                        }`}
                      />
                      <span className="text-xs font-serif font-medium">
                        {reactedLocally[activeLetter.id] ? 'I felt this too (whispered)' : 'I felt this too'}
                      </span>
                    </button>
                    <span className="text-xs font-note text-[#666747]">
                      * Connections remain tender and anonymous
                    </span>
                  </div>

                  {/* Thoughtful Response box */}
                  <div className="bg-[#FFF8F0]/60 p-4 rounded-2xl border border-[#E9D9C9]">
                    <div className="flex items-center gap-1.5 mb-2 text-xs font-serif text-[#44352F] font-semibold">
                      <Mail className="w-3.5 h-3.5 text-[#B98289]" />
                      <span>Leave a thoughtful response to this letter:</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Offer kind words or reassurance..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-hidden focus:border-[#B98289]"
                      />
                      <button
                        type="button"
                        disabled={!replyText.trim()}
                        onClick={() => {
                          if (onReplyLetter && replyText.trim()) {
                            onReplyLetter(activeLetter.id, replyText.trim());
                            setReplyText('');
                            setReplySuccess(true);
                            setTimeout(() => setReplySuccess(false), 3000);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#B98289] hover:bg-[#A66D74] text-white text-xs font-serif disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                    {replySuccess && (
                      <p className="text-[11px] font-sans-clean text-[#666747] mt-1.5 text-right animate-fadeIn">
                        ✦ Your gentle response has been delivered to the author's drawer.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="text-right pt-4 border-t border-[#E9D9C9]">
                <WaxSeal className="w-10 h-10 inline-flex" label="ST" />
              </div>
            </div>

            {/* Delete Confirmation Inside Modal */}
            {confirmDeleteId === activeLetter.id && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 mt-4 text-xs space-y-2">
                <p className="font-semibold text-red-800">
                  Are you sure you wish to burn this letter?
                </p>
                <p className="text-red-700">
                  This action cannot be undone. The letter will be erased from this local desk.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Keep Letter
                  </button>
                  <button
                    onClick={() => handleDelete(activeLetter.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
                  >
                    Burn & Erase
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
