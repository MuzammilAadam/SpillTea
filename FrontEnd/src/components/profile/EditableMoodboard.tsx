import React, { useState, useEffect } from 'react';
import { MoodboardItem } from '../../types';
import { moodboardApi } from '../../api/moodboards';
import { useAuth } from '../../context/AuthContext';
import {
  Edit3,
  Plus,
  Trash2,
  Check,
  RotateCw,
  Image,
  Quote,
  FileText,
  Coffee,
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye,
  Save,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import {
  WashiTapeStrip,
  PaperClip,
  PressedFlower,
  TeacupIcon,
  OliveBranch,
} from '../common/Botanicals';

interface EditableMoodboardProps {
  initialCards?: MoodboardItem[];
  pseudonym: string;
  isOwner: boolean;
  onToast: (msg: string) => void;
}

const DEFAULT_CARDS: MoodboardItem[] = [
  {
    id: 'default-1',
    type: 'note',
    title: 'handwritten note to self',
    content: '“Be gentle with yourself. You are shedding old skin, and blooming is slow, sacred work. Breathe through the quiet days.”',
    author: 'Eleanor',
    rotation: '-rotate-1',
    washiTape: false,
  },
  {
    id: 'default-2',
    type: 'image',
    title: 'October Wildflowers',
    content: 'pressed between pages of my favorite book',
    image: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=600&q=80',
    rotation: 'rotate-2',
  },
  {
    id: 'default-3',
    type: 'quote',
    content: '“Softness is not weakness. It takes courage to stay delicate in a world that urges you to be callous.”',
    author: 'Antoine de Saint-Exupéry',
    rotation: 'rotate-1',
    washiTape: true,
  },
  {
    id: 'default-4',
    type: 'image',
    title: 'Rainy Sunday Shelves',
    content: 'worn paper and tea',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    rotation: '-rotate-2',
  },
  {
    id: 'default-5',
    type: 'note',
    title: 'Tea Ritual',
    content: 'Drinking peppermint tea with dried chamomile leaves. Reminding myself that silence is not an empty room, but a full one.',
    author: 'Evening sanctuary • 8:45 PM',
    rotation: 'rotate-2',
  },
  {
    id: 'default-6',
    type: 'image',
    title: 'Quiet Porcelain',
    content: 'taking ten minutes to breathe',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    rotation: 'rotate-1',
  },
];

export const EditableMoodboard: React.FC<EditableMoodboardProps> = ({
  initialCards,
  pseudonym,
  isOwner,
  onToast,
}) => {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<MoodboardItem[]>(initialCards && initialCards.length > 0 ? initialCards : DEFAULT_CARDS);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  // Card creation / editing modal
  const [editingCard, setEditingCard] = useState<Partial<MoodboardItem> | null>(null);
  const [cardModalMode, setCardModalMode] = useState<'create' | 'edit'>('create');

  // Load moodboard from API if available
  useEffect(() => {
    let mounted = true;
    const fetchBoard = async () => {
      try {
        if (isOwner && isAuthenticated) {
          const res = await moodboardApi.getMyMoodboard();
          if (mounted && res && res.cards && res.cards.length > 0) {
            setCards(res.cards);
            setIsPublished(res.published);
          }
        } else if (pseudonym) {
          const res = await moodboardApi.getPublicMoodboard(pseudonym);
          if (mounted && res && res.cards && res.cards.length > 0) {
            setCards(res.cards);
            setIsPublished(res.published);
          }
        }
      } catch (err) {
        console.warn('Using local moodboard items:', err);
      }
    };
    fetchBoard();
    return () => { mounted = false; };
  }, [pseudonym, isOwner, isAuthenticated]);

  // Save Draft to Backend
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await moodboardApi.saveDraft({
          cards,
        });
      }
      localStorage.setItem(`spilltea_moodboard_${pseudonym}`, JSON.stringify(cards));
      onToast('Moodboard draft safely saved in your desk drawer.');
    } catch (err: any) {
      onToast(err?.message || 'Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  // Publish to Backend
  const handlePublish = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        // Save latest cards first to ensure draft is synced
        await moodboardApi.saveDraft({ cards });
        const res = await moodboardApi.publish();
        if (res && res.cards) {
          setCards(res.cards);
        }
      }
      setIsPublished(true);
      setIsEditing(false);
      localStorage.setItem(`spilltea_moodboard_${pseudonym}`, JSON.stringify(cards));
      onToast('Your scrapbook moodboard has been published for gentle wandering souls!');
    } catch (err: any) {
      onToast(err?.message || 'Failed to publish moodboard.');
    } finally {
      setSaving(false);
    }
  };

  // Discard draft
  const handleDiscard = async () => {
    if (!confirm('Discard all unsaved edits and restore last published moodboard?')) return;
    try {
      if (isAuthenticated) {
        const res = await moodboardApi.discardDraft();
        if (res && res.cards) setCards(res.cards);
      }
      setIsEditing(false);
      onToast('Draft discarded. Restored to published version.');
    } catch (err: any) {
      onToast('Restored previous layout.');
      setIsEditing(false);
    }
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    onToast('Card gently lifted from the scrapbook.');
  };

  // Move Card Left/Right in Order
  const handleMoveCard = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;
    setCards(newCards);
  };

  // Open modal to add new card
  const handleOpenAddCard = (type: 'note' | 'image' | 'quote') => {
    setEditingCard({
      id: `card-${Date.now()}`,
      type,
      title: type === 'note' ? 'Note to Self' : type === 'image' ? 'Polaroid Memory' : 'Quiet Reflection',
      content: '',
      author: '',
      image: type === 'image' ? 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80' : undefined,
      rotation: 'rotate-1',
      washiTape: true,
    });
    setCardModalMode('create');
  };

  // Save Card from Modal
  const handleSaveCardModal = () => {
    if (!editingCard) return;
    if (!editingCard.content && !editingCard.image) {
      onToast('Please write some thoughts or provide an image.');
      return;
    }

    if (cardModalMode === 'create') {
      setCards(prev => [editingCard as MoodboardItem, ...prev]);
      onToast('Penciled onto scrapbook canvas!');
    } else {
      setCards(prev => prev.map(c => c.id === editingCard.id ? (editingCard as MoodboardItem) : c));
      onToast('Card updated beautifully.');
    }
    setEditingCard(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Editor Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFCF8] p-4 rounded-2xl border border-[#E9D9C9] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9]">
            <Sparkles className="w-5 h-5 text-[#B98289]" />
          </div>
          <div>
            <h3 className="font-editorial font-bold text-lg text-[#44352F]">
              Scrapbook Moodboard
            </h3>
            <p className="font-note text-sm text-[#666747]">
              {isEditing
                ? 'Editing mode active — arrange your polaroids & notes'
                : 'polaroids, pressed flowers, and quiet reminders'}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center flex-wrap gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-[#FFF8F0] border border-[#B98289] text-[#B98289] hover:bg-[#B98289] hover:text-white transition-all text-xs font-serif font-medium cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Arrange Moodboard</span>
              </button>
            ) : (
              <>
                {/* Add Card Dropdown buttons */}
                <div className="flex items-center gap-1 bg-[#F4EBE1] p-1 rounded-xl border border-[#E9D9C9]">
                  <button
                    type="button"
                    onClick={() => handleOpenAddCard('note')}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-serif text-[#44352F] hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    title="Add Handwritten Note"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B98289]" />
                    <span>Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddCard('image')}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-serif text-[#44352F] hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    title="Add Polaroid Photo"
                  >
                    <Image className="w-3.5 h-3.5 text-[#666747]" />
                    <span>Polaroid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddCard('quote')}
                    className="p-1.5 px-2.5 rounded-lg text-xs font-serif text-[#44352F] hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    title="Add Quote Card"
                  >
                    <Quote className="w-3.5 h-3.5 text-[#D8A0A5]" />
                    <span>Quote</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="px-3 py-2 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9] text-[#44352F] hover:border-[#B98289] text-xs font-serif cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#666747]" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handlePublish}
                  className="px-4 py-2 rounded-xl bg-[#B98289] hover:bg-[#A66D74] text-white text-xs font-serif font-bold cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>

                <button
                  type="button"
                  onClick={handleDiscard}
                  className="p-2 text-[#666747] hover:text-[#44352F] rounded-lg cursor-pointer"
                  title="Discard changes and exit edit mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Scrapbook Canvas: Masonry-style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {cards.map((card, index) => {
          const rotationClass = card.rotation || (index % 2 === 0 ? '-rotate-1' : 'rotate-1');

          return (
            <div
              key={card.id || index}
              className={`group relative transition-all duration-300 ${
                isEditing ? 'ring-2 ring-dashed ring-[#B98289]/40 p-2 rounded-2xl bg-white/40' : ''
              }`}
            >
              {/* Edit Mode Toolbar over Card */}
              {isEditing && (
                <div className="absolute -top-3 right-3 z-30 flex items-center gap-1 bg-[#FFFCF8] border border-[#E9D9C9] rounded-full p-1 shadow-md">
                  <button
                    type="button"
                    onClick={() => handleMoveCard(index, 'left')}
                    disabled={index === 0}
                    className="p-1 text-[#666747] hover:text-[#44352F] disabled:opacity-30 cursor-pointer"
                    title="Move earlier"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCard(index, 'right')}
                    disabled={index === cards.length - 1}
                    className="p-1 text-[#666747] hover:text-[#44352F] disabled:opacity-30 cursor-pointer"
                    title="Move later"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCard(card);
                      setCardModalMode('edit');
                    }}
                    className="p-1 text-[#B98289] hover:text-[#A66D74] cursor-pointer"
                    title="Edit card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 text-[#C46873] hover:text-[#A84855] cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CARD TYPE 1: NOTE */}
              {card.type === 'note' && (
                <div
                  className={`relative bg-[#FFF8F0] p-6 rounded-2xl border border-dashed border-[#B98289]/60 shadow-md transform ${rotationClass} hover:rotate-0 transition-transform`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <PaperClip className="w-6 h-8 text-[#B98289]" />
                  </div>
                  {card.title && (
                    <span className="text-[10px] font-sans-clean font-bold uppercase tracking-wider text-[#B98289]">
                      {card.title}
                    </span>
                  )}
                  <p className="font-note text-2xl text-[#44352F] mt-3 leading-relaxed">
                    {card.content}
                  </p>
                  {card.author && (
                    <div className="text-right mt-3 text-xs font-serif text-[#666747]">
                      ~ {card.author}
                    </div>
                  )}
                </div>
              )}

              {/* CARD TYPE 2: POLAROID IMAGE */}
              {card.type === 'image' && (
                <div
                  className={`polaroid-frame transform ${rotationClass} hover:rotate-0 transition-transform duration-300`}
                >
                  {card.washiTape !== false && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                      <WashiTapeStrip color="#B7B99A" width="w-20" rotation="-rotate-2" />
                    </div>
                  )}
                  <div className="h-64 overflow-hidden rounded-xs bg-gray-100">
                    <img
                      src={card.image || 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=600&q=80'}
                      alt={card.title || 'Polaroid Memory'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 text-center">
                    {card.title && (
                      <p className="font-note text-xl text-[#44352F]">{card.title}</p>
                    )}
                    {card.content && (
                      <p className="font-serif text-xs text-[#666747]">{card.content}</p>
                    )}
                  </div>
                </div>
              )}

              {/* CARD TYPE 3: QUOTE */}
              {card.type === 'quote' && (
                <div
                  className={`relative bg-[#F7DDE1]/60 p-6 rounded-2xl border border-[#D8A0A5] shadow-md transform ${rotationClass} hover:rotate-0 transition-transform`}
                >
                  <WashiTapeStrip color="#B7B99A" width="w-20" rotation="-rotate-3" className="mb-2" />
                  <p className="font-editorial italic text-xl text-[#44352F] leading-snug">
                    {card.content}
                  </p>
                  {card.author && (
                    <span className="block mt-4 text-xs font-serif text-[#666747]">
                      — {card.author}
                    </span>
                  )}
                </div>
              )}

              {/* CARD TYPE 4: PROMPT / REFLECTION */}
              {card.type === 'prompt' && (
                <div
                  className={`relative bg-[#FFFCF8] p-6 rounded-2xl border border-[#E9D9C9] shadow-md transform ${rotationClass} hover:rotate-0 transition-transform`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TeacupIcon className="w-4 h-4 text-[#B98289]" />
                    <span className="font-serif text-xs font-semibold uppercase tracking-wider text-[#666747]">
                      {card.title || 'Tea Ritual'}
                    </span>
                  </div>
                  <p className="font-body text-sm text-[#44352F] leading-relaxed">
                    {card.content}
                  </p>
                  {card.author && (
                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#E9D9C9] text-xs font-note text-[#B98289]">
                      <span>{card.author}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Edit / Create Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-7 shadow-2xl">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 p-2 text-[#666747] hover:text-[#44352F] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-2xl font-bold text-[#44352F] mb-4">
              {cardModalMode === 'create' ? 'Add to Scrapbook' : 'Edit Scrapbook Card'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Card Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['note', 'image', 'quote'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditingCard({ ...editingCard, type: t })}
                      className={`py-2 text-xs font-serif rounded-xl border capitalize cursor-pointer ${
                        editingCard.type === t
                          ? 'bg-[#B98289] text-white border-[#B98289]'
                          : 'bg-white text-[#44352F] border-[#E9D9C9]'
                      }`}
                    >
                      {t === 'image' ? 'Polaroid' : t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Title / Caption Header
                </label>
                <input
                  type="text"
                  value={editingCard.title || ''}
                  onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                  placeholder="e.g. October Wildflowers"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Content / Words
                </label>
                <textarea
                  rows={4}
                  value={editingCard.content || ''}
                  onChange={e => setEditingCard({ ...editingCard, content: e.target.value })}
                  placeholder="Write your gentle words here..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F]"
                />
              </div>

              {editingCard.type === 'image' && (
                <div>
                  <label className="block text-xs font-serif text-[#666747] mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editingCard.image || ''}
                    onChange={e => setEditingCard({ ...editingCard, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Author / Subtle Footer
                </label>
                <input
                  type="text"
                  value={editingCard.author || ''}
                  onChange={e => setEditingCard({ ...editingCard, author: e.target.value })}
                  placeholder="e.g. Eleanor or Evening sanctuary"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-serif text-[#666747]">Rotation:</label>
                  <select
                    value={editingCard.rotation || 'rotate-0'}
                    onChange={e => setEditingCard({ ...editingCard, rotation: e.target.value })}
                    className="px-2 py-1 text-xs bg-white border border-[#E9D9C9] rounded-lg text-[#44352F]"
                  >
                    <option value="-rotate-2">Tilt Left (-2°)</option>
                    <option value="-rotate-1">Gentle Left (-1°)</option>
                    <option value="rotate-0">Straight (0°)</option>
                    <option value="rotate-1">Gentle Right (+1°)</option>
                    <option value="rotate-2">Tilt Right (+2°)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-4 py-2 text-xs font-serif text-[#666747] hover:text-[#44352F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCardModal}
                    className="px-5 py-2 text-xs font-serif bg-[#B98289] hover:bg-[#A66D74] text-white rounded-xl shadow-xs font-bold"
                  >
                    {cardModalMode === 'create' ? 'Pin to Board' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
