import React, { useState, useEffect, useRef } from 'react';
import { MoodboardItem, UploadResponse } from '../../types';
import { moodboardApi } from '../../api/moodboards';
import { uploadsApi } from '../../api/uploads';
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
  FolderOpen,
  Loader2,
  HardDrive,
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
  onRequireAuth?: (action: () => void, message?: string) => boolean;
}

const DEFAULT_CARDS: MoodboardItem[] = [
  {
    id: 'default-1',
    type: 'note',
    title: 'handwritten note to self',
    content: '"Be gentle with yourself. You are shedding old skin, and blooming is slow, sacred work. Breathe through the quiet days."',
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
    content: '"Softness is not weakness. It takes courage to stay delicate in a world that urges you to be callous."',
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
  onRequireAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const [cards, setCards] = useState<MoodboardItem[]>(initialCards || []);
  const [boardLoading, setBoardLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  // Card creation / editing modal
  const [editingCard, setEditingCard] = useState<Partial<MoodboardItem> | null>(null);
  const [cardModalMode, setCardModalMode] = useState<'create' | 'edit'>('create');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<UploadResponse[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Memory popover & Preview Before Insertion Modal state
  const [showAddPhotoMenu, setShowAddPhotoMenu] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [previewCaption, setPreviewCaption] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('Memory Photo');
  const [previewStyle, setPreviewStyle] = useState<'polaroid' | 'tilted' | 'handwritten' | 'tape' | 'cream-frame'>('polaroid');
  const [previewCardSize, setPreviewCardSize] = useState<'normal' | 'wide' | 'compact'>('normal');
  const [isInserting, setIsInserting] = useState(false);
  const addPhotoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addPhotoMenuRef.current && !addPhotoMenuRef.current.contains(e.target as Node)) {
        setShowAddPhotoMenu(false);
      }
    };
    if (showAddPhotoMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showAddPhotoMenu]);

  // Load moodboard from API if available
  useEffect(() => {
    let mounted = true;
    const fetchBoard = async () => {
      try {
        if (isOwner && isAuthenticated) {
          const res = await moodboardApi.getMyMoodboard();
          if (mounted && res) {
            setCards(res.cards || []);
            setIsPublished(res.published);
          }
        } else if (pseudonym) {
          const res = await moodboardApi.getPublicMoodboard(pseudonym);
          if (mounted && res) {
            setCards(res.cards || []);
            setIsPublished(res.published);
          }
        }
      } catch (err) {
        console.warn('Could not load moodboard:', err);
      } finally {
        if (mounted) setBoardLoading(false);
      }
    };
    fetchBoard();
    return () => { mounted = false; };
  }, [pseudonym, isOwner, isAuthenticated]);

  // Load gallery images when gallery opens
  const handleOpenGallery = async () => {
    setShowGallery(true);
    setGalleryLoading(true);
    try {
      const images = await uploadsApi.getMyUploadedImages();
      setGalleryImages(images || []);
    } catch (err) {
      console.warn('Could not load gallery:', err);
      setGalleryImages([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  // Handle file selection from native file picker -> open preview modal
  const handleFileUpload = (file: File) => {
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      onToast('Please select a valid photograph (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast('Photographs must be 5 MB or smaller.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewImageUrl(objectUrl);
    setPreviewCaption('');
    setPreviewTitle('A quiet memory');
    setPreviewStyle('polaroid');
    setPreviewCardSize('normal');
    setShowAddPhotoMenu(false);
    setPreviewModalOpen(true);
  };

  // Select image from gallery -> open preview modal
  const handleSelectFromGallery = (image: UploadResponse) => {
    setPendingFile(null);
    setPreviewImageUrl(image.url);
    setPreviewCaption('');
    setPreviewTitle(image.originalFilename ? image.originalFilename.replace(/\.[^/.]+$/, '') : 'A quiet memory');
    setPreviewStyle('polaroid');
    setPreviewCardSize('normal');
    setShowGallery(false);
    setShowAddPhotoMenu(false);
    setPreviewModalOpen(true);
    onToast('Previewing memory photo for insertion.');
  };

  // Confirm photo insertion from preview modal
  const handleConfirmInsertion = async () => {
    setIsInserting(true);
    try {
      let finalUrl = previewImageUrl;
      if (pendingFile) {
        setIsUploading(true);
        setUploadProgress(30);
        const progressTimer = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 20, 85));
        }, 200);

        const res = await uploadsApi.uploadImage(pendingFile);
        clearInterval(progressTimer);
        setUploadProgress(100);
        finalUrl = res.url;
        setGalleryImages(prev => [res, ...prev]);
      }

      const newPhotoCard: MoodboardItem = {
        id: `card-${Date.now()}`,
        type: 'image',
        title: previewTitle.trim() || 'A quiet memory',
        content: previewCaption.trim(),
        image: finalUrl,
        rotation: previewStyle === 'tilted' ? '-rotate-2' : 'rotate-1',
        washiTape: previewStyle === 'tape' || previewStyle === 'polaroid',
        photoStyle: previewStyle,
        cardSize: previewCardSize,
      };

      setCards(prev => [newPhotoCard, ...prev]);
      onToast('Memory photo added to moodboard draft ✦');
      setPreviewModalOpen(false);
      setPendingFile(null);
    } catch (err: any) {
      onToast(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsInserting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Save Draft to Backend
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await moodboardApi.saveDraft({
          cards,
        });
      }
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
      onToast('Could not restore the saved moodboard. Please try again.');
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />

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
                onClick={() => {
                  if (!isAuthenticated && onRequireAuth) {
                    onRequireAuth(() => setIsEditing(true), 'Sign in to arrange and personalize your scrapbook moodboard.');
                    return;
                  }
                  setIsEditing(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#FFF8F0] border border-[#B98289] text-[#B98289] hover:bg-[#B98289] hover:text-white transition-all text-xs font-serif font-medium cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Arrange Moodboard</span>
              </button>
            ) : (
              <>
                {/* Add Photo Popover Menu */}
                <div className="relative" ref={addPhotoMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowAddPhotoMenu((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-[#F7DDE1] hover:bg-[#F4D0D5] text-[#44352F] font-serif text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Add Memory Photograph"
                  >
                    <Image className="w-3.5 h-3.5 text-[#B98289]" />
                    <span>Add photo</span>
                  </button>

                  {/* Popover */}
                  {showAddPhotoMenu && (
                    <div className="absolute left-0 top-full mt-2 w-60 bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] shadow-xl p-2 z-40 animate-fadeIn text-left">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddPhotoMenu(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full text-left p-2.5 rounded-xl text-xs font-serif text-[#44352F] hover:bg-[#FFF8F0] flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-[#B98289]" />
                        <div>
                          <span className="font-semibold block">Upload from gallery</span>
                          <span className="text-[10px] text-[#666747]">Select JPEG, PNG, or WebP</span>
                        </div>
                      </button>

                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddPhotoMenu(false);
                            handleOpenGallery();
                          }}
                          className="w-full text-left p-2.5 rounded-xl text-xs font-serif text-[#44352F] hover:bg-[#FFF8F0] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <FolderOpen className="w-4 h-4 text-[#666747]" />
                          <div>
                            <span className="font-semibold block">Choose from existing memories</span>
                            <span className="text-[10px] text-[#666747]">Browse your upload chest</span>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowAddPhotoMenu(false)}
                        className="w-full text-left p-2 rounded-xl text-xs font-serif text-[#666747] hover:bg-[#F4EBE1] flex items-center gap-2 cursor-pointer transition-colors border-t border-[#E9D9C9]/50 mt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Note & Quote quick buttons */}
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
      {boardLoading ? (
        <div className="py-20 text-center font-serif text-[#666747]">Opening your scrapbook...</div>
      ) : cards.length === 0 ? (
        <div className="py-20 text-center bg-[#FFF8F0] rounded-3xl border border-dashed border-[#E9D9C9]">
          <HardDrive className="w-10 h-10 mx-auto mb-3 text-[#B98289]/70" />
          <h3 className="font-editorial text-2xl text-[#44352F]">A fresh scrapbook page</h3>
          <p className="mt-2 text-sm text-[#666747]">Add a memory when you are ready.</p>
          {isOwner && <button type="button" onClick={() => setIsEditing(true)} className="mt-5 px-5 py-2 rounded-full bg-[#B98289] text-white font-serif text-sm">Add Memory</button>}
        </div>
      ) : (
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

              {/* CARD TYPE 2: SCRAPBOOK PHOTO / POLAROID */}
              {(card.type === 'image' || card.type === 'photo') && (
                <div
                  className={`transform ${rotationClass} hover:rotate-0 transition-all duration-300 ${
                    card.photoStyle === 'tilted'
                      ? 'photocard-tilted'
                      : card.photoStyle === 'handwritten'
                      ? 'photocard-handwritten'
                      : card.photoStyle === 'tape'
                      ? 'photocard-tape'
                      : card.photoStyle === 'cream-frame'
                      ? 'photocard-cream-frame'
                      : 'photocard-polaroid'
                  }`}
                >
                  {/* Decorative tape for tape or polaroid styles */}
                  {card.photoStyle === 'tape' && (
                    <>
                      <div className="absolute -top-3 left-4 pointer-events-none z-10">
                        <WashiTapeStrip color="#F7DDE1" width="w-16" rotation="-rotate-3" />
                      </div>
                      <div className="absolute -top-3 right-4 pointer-events-none z-10">
                        <WashiTapeStrip color="#B7B99A" width="w-16" rotation="rotate-3" />
                      </div>
                    </>
                  )}
                  {(!card.photoStyle || card.photoStyle === 'polaroid') && card.washiTape !== false && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                      <WashiTapeStrip color="#B7B99A" width="w-20" rotation="-rotate-2" />
                    </div>
                  )}

                  <div
                    className={`${
                      card.cardSize === 'compact'
                        ? 'h-48'
                        : card.cardSize === 'wide'
                        ? 'h-80'
                        : 'h-64'
                    } overflow-hidden rounded-xs bg-[#F4EBE1]`}
                  >
                    <img
                      src={card.image || 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?auto=format&fit=crop&w=600&q=80'}
                      alt={card.title || 'Scrapbook Memory'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="pt-3 text-center">
                    {card.title && (
                      <p
                        className={`${
                          card.photoStyle === 'handwritten'
                            ? 'font-note text-2xl text-[#B98289]'
                            : 'font-editorial font-bold text-lg text-[#44352F]'
                        }`}
                      >
                        {card.title}
                      </p>
                    )}
                    {card.content && (
                      <p
                        className={`${
                          card.photoStyle === 'handwritten'
                            ? 'font-note text-lg text-[#44352F]'
                            : 'font-serif text-xs text-[#666747]'
                        } mt-0.5 leading-snug`}
                      >
                        {card.content}
                      </p>
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
      )}

      {/* Card Edit / Create Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
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

              {/* ── IMAGE UPLOAD SECTION ──────────────────────────────────── */}
              {editingCard.type === 'image' && (
                <div className="space-y-3">
                  <label className="block text-xs font-serif text-[#666747] mb-1">
                    Polaroid Photo
                  </label>

                  {/* Current image preview */}
                  {editingCard.image && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[#E9D9C9] bg-gray-50">
                      <img
                        src={editingCard.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCard({ ...editingCard, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-[#C46873] hover:bg-white shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upload progress bar */}
                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#666747]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B98289]" />
                        <span>Developing your photo...</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E9D9C9] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#B98289] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload action buttons */}
                  {!isUploading && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Upload from device */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#D8A0A5] bg-[#FFF8F0] hover:bg-[#F7DDE1]/30 text-[#B98289] text-xs font-serif cursor-pointer transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload from device</span>
                      </button>

                      {/* Gallery picker (only for authenticated users) */}
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={handleOpenGallery}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-[#B7B99A] bg-[#FFFCF8] hover:bg-[#B7B99A]/10 text-[#666747] text-xs font-serif cursor-pointer transition-all"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span>My gallery</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Manual URL input (fallback) */}
                  <div>
                    <label className="block text-[11px] font-serif text-[#666747]/70 mb-1">
                      Or paste image URL directly
                    </label>
                    <input
                      type="text"
                      value={editingCard.image || ''}
                      onChange={e => setEditingCard({ ...editingCard, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E9D9C9] rounded-xl focus:outline-hidden focus:border-[#B98289] text-[#44352F]"
                    />
                  </div>
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

      {/* ── Gallery Picker Modal ──────────────────────────────────────────────── */}
      {showGallery && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] shadow-2xl overflow-hidden">
            {/* Gallery Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E9D9C9] bg-[#FFF8F0]">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#B98289]" />
                <h3 className="font-editorial font-bold text-lg text-[#44352F]">
                  My Photo Gallery
                </h3>
                <span className="text-xs text-[#666747] font-serif">
                  — previously uploaded memories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B98289] text-white text-xs font-serif cursor-pointer hover:bg-[#A66D74] transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload new</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGallery(false)}
                  className="p-2 text-[#666747] hover:text-[#44352F] rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {galleryLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 text-[#B98289] animate-spin mb-3" />
                  <p className="font-serif text-sm text-[#666747]">Developing your memories...</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-16">
                  <PressedFlower className="w-10 h-10 text-[#D8A0A5] mx-auto mb-3 opacity-50" />
                  <p className="font-editorial text-lg text-[#44352F]">
                    Your gallery is empty
                  </p>
                  <p className="font-serif text-xs text-[#666747] mt-1">
                    Upload your first photo to begin decorating your scrapbook.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGallery(false);
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#B98289] text-white text-xs font-serif cursor-pointer hover:bg-[#A66D74]"
                  >
                    Upload first photo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectFromGallery(img)}
                      className="group relative aspect-square rounded-xl overflow-hidden border-2 border-[#E9D9C9] hover:border-[#B98289] transition-all cursor-pointer"
                      title={img.originalFilename || 'Uploaded photo'}
                    >
                      <img
                        src={img.url}
                        alt={img.originalFilename || 'Gallery photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-serif truncate">
                          Select this photo
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── Preview Before Insertion Modal ────────────────────────────────────── */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div
            className="relative w-full max-w-lg bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh]"
            style={{
              backgroundImage: 'radial-gradient(#e5dfd3 0.75px, transparent 0.75px)',
              backgroundSize: '16px 16px',
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none">
              <WashiTapeStrip color="#F7DDE1" width="w-28" rotation="-rotate-1" />
            </div>

            <button
              type="button"
              onClick={() => {
                setPreviewModalOpen(false);
                setPendingFile(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-[#666747] hover:text-[#44352F] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-editorial text-2xl font-bold text-[#44352F] mb-1">
              Insert Memory Photograph
            </h3>
            <p className="font-serif italic text-xs text-[#666747] mb-5">
              Review and style your photograph before placing it gently on your moodboard.
            </p>

            {/* Photo preview in selected style */}
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-[#E9D9C9] mb-5 flex justify-center">
              <div
                className={`w-full max-w-xs transition-all ${
                  previewStyle === 'tilted'
                    ? 'photocard-tilted -rotate-1'
                    : previewStyle === 'handwritten'
                    ? 'photocard-handwritten'
                    : previewStyle === 'tape'
                    ? 'photocard-tape'
                    : previewStyle === 'cream-frame'
                    ? 'photocard-cream-frame'
                    : 'photocard-polaroid'
                }`}
              >
                {previewStyle === 'tape' && (
                  <div className="absolute -top-3 left-4 pointer-events-none z-10">
                    <WashiTapeStrip color="#B7B99A" width="w-16" rotation="-rotate-2" />
                  </div>
                )}
                {previewStyle === 'polaroid' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                    <WashiTapeStrip color="#F7DDE1" width="w-16" rotation="rotate-1" />
                  </div>
                )}
                <div className="h-48 overflow-hidden rounded-xs bg-gray-100">
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-2 text-center">
                  <p
                    className={`${
                      previewStyle === 'handwritten'
                        ? 'font-note text-xl text-[#B98289]'
                        : 'font-editorial font-bold text-base text-[#44352F]'
                    }`}
                  >
                    {previewTitle || 'A little moment I want to remember…'}
                  </p>
                  {previewCaption && (
                    <p
                      className={`${
                        previewStyle === 'handwritten'
                          ? 'font-note text-base text-[#44352F]'
                          : 'font-serif text-xs text-[#666747]'
                      }`}
                    >
                      {previewCaption}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={previewTitle}
                  onChange={(e) => setPreviewTitle(e.target.value)}
                  placeholder="e.g. October Wildflowers"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E9D9C9] rounded-xl text-[#44352F] focus:outline-hidden focus:border-[#B98289]"
                />
              </div>

              <div>
                <label className="block text-xs font-serif text-[#666747] mb-1">
                  Handwritten Caption
                </label>
                <input
                  type="text"
                  value={previewCaption}
                  onChange={(e) => setPreviewCaption(e.target.value)}
                  placeholder="A little moment I want to remember…"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E9D9C9] rounded-xl text-[#44352F] focus:outline-hidden focus:border-[#B98289]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif text-[#666747] mb-1">
                    Photo Card Style
                  </label>
                  <select
                    value={previewStyle}
                    onChange={(e) => setPreviewStyle(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-[#E9D9C9] rounded-xl text-[#44352F]"
                  >
                    <option value="polaroid">Classic Polaroid (White border)</option>
                    <option value="tilted">Tilted Photograph (Paper shadow)</option>
                    <option value="handwritten">Handwritten Caption Underneath</option>
                    <option value="tape">Decorative Washi Tape Element</option>
                    <option value="cream-frame">Thin Cream Frame</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif text-[#666747] mb-1">
                    Card Size
                  </label>
                  <select
                    value={previewCardSize}
                    onChange={(e) => setPreviewCardSize(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-[#E9D9C9] rounded-xl text-[#44352F]"
                  >
                    <option value="normal">Normal (Single grid column)</option>
                    <option value="compact">Compact (Petite)</option>
                    <option value="wide">Wide (Spans across)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E9D9C9]">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewModalOpen(false);
                    setPendingFile(null);
                  }}
                  className="px-4 py-2 text-xs font-serif text-[#666747] hover:text-[#44352F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isInserting}
                  onClick={handleConfirmInsertion}
                  className="px-5 py-2.5 rounded-xl bg-[#B98289] hover:bg-[#A66D74] text-white text-xs font-serif font-bold cursor-pointer transition-all flex items-center gap-2 shadow-xs"
                >
                  {isInserting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Developing & Pinning...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pin to Moodboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
