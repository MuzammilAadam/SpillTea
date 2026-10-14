import React, { useEffect, useState } from 'react';
import { KindredProfile, UserProfile, Story } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Edit3,
  Heart,
  Sparkles,
  Bookmark,
  BookOpen,
  Pin,
  Camera,
  Check,
  X,
  Palette,
  Coffee,
} from 'lucide-react';
import {
  TeacupIcon,
  PressedFlower,
  LavenderSprig,
  OliveBranch,
  WashiTapeStrip,
  PaperClip,
  WaxSeal,
} from '../common/Botanicals';
import { EditableMoodboard } from './EditableMoodboard';
import { profileApi } from '../../api/profile';

interface ProfileViewProps {
  user: UserProfile;
  stories: Story[];
  onUpdateProfile: (updated: Partial<UserProfile>) => Promise<void> | void;
  onOpenProfile?: (pseudonym: string) => void;
  onReadStory: (story: Story) => void;
  onToast?: (msg: string) => void;
  onRequireAuth?: (action: () => void, message?: string) => boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stories,
  onUpdateProfile,
  onOpenProfile,
  onReadStory,
  onToast = () => {},
  onRequireAuth,
}) => {
  const { currentUser, isAuthenticated } = useAuth();
  const isOwner = isAuthenticated && (!currentUser?.pseudonym || currentUser?.pseudonym === user.pseudonym);
  const [activeTab, setActiveTab] = useState<'moodboard' | 'stories' | 'collections' | 'about'>('moodboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [kindredStats, setKindredStats] = useState(user.kindredStats);
  const [relationship, setRelationship] = useState({ following: false, mutualKindred: false });
  const [relationshipBusy, setRelationshipBusy] = useState(false);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const [listType, setListType] = useState<'kindred' | 'my-kindred' | null>(null);
  const [kindredList, setKindredList] = useState<KindredProfile[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listSearch, setListSearch] = useState('');
  const [listPage, setListPage] = useState(0);
  const [listHasMore, setListHasMore] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user.displayName);
  const [editPseudonym, setEditPseudonym] = useState(user.pseudonym);
  const [editBio, setEditBio] = useState(user.bio);
  const [editFeeling, setEditFeeling] = useState(user.currentlyFeeling);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editAccent, setEditAccent] = useState(user.themeAccent);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const themePresets = ['#D8A0A5', '#B98289', '#B7B99A', '#666747', '#E9D9C9'];

  useEffect(() => {
    setEditName(user.displayName); setEditPseudonym(user.pseudonym); setEditBio(user.bio || '');
    setEditFeeling(user.currentlyFeeling || ''); setEditAvatar(user.avatar || ''); setEditAccent(user.themeAccent || '#D8A0A5');
    setKindredStats(undefined);
    profileApi.getStats(user.id).then(setKindredStats).catch(() => setKindredStats(undefined));
    if (!isOwner && isAuthenticated) {
      profileApi.relationship(user.id).then(setRelationship).catch(() => setRelationship({ following: false, mutualKindred: false }));
    }
  }, [user.id, isOwner, isAuthenticated]);

  const openKindredList = async (type: 'kindred' | 'my-kindred') => {
    setListType(type); setListSearch(''); setListPage(0); setListLoading(true); setListError(null);
    try {
      const page = type === 'kindred' ? await profileApi.getKindred(user.id) : await profileApi.getMyKindred(user.id);
      setKindredList(page.content); setListHasMore(!page.last);
    } catch { setListError('This little list could not be opened just now.'); }
    finally { setListLoading(false); }
  };

  const loadMoreKindred = async () => {
    if (!listType || !listHasMore) return;
    setListLoading(true);
    try {
      const nextPage = listPage + 1;
      const page = listType === 'kindred' ? await profileApi.getKindred(user.id, nextPage) : await profileApi.getMyKindred(user.id, nextPage);
      setKindredList((current) => [...current, ...page.content]); setListPage(nextPage); setListHasMore(!page.last);
    } catch { setListError('More Kindred could not be gathered just now.'); }
    finally { setListLoading(false); }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { onToast('Sign in to find your way to this little corner.'); return; }
    setRelationshipBusy(true);
    try {
      const next = relationship.following ? await profileApi.unfollow(user.id) : await profileApi.follow(user.id);
      setKindredStats(next);
      setRelationship({ following: !relationship.following, mutualKindred: relationship.mutualKindred });
      const refreshed = await profileApi.getMyProfile();
      await onUpdateProfile({ displayName: refreshed.displayName, pseudonym: refreshed.pseudonym, bio: refreshed.bio, currentlyFeeling: refreshed.currentlyFeeling, avatar: refreshed.avatar, themeAccent: refreshed.themeAccent });
      onToast(relationship.following ? 'You gently stepped away from this corner.' : 'You found your way to this little corner.');
    } catch (error: any) { onToast(error?.message || 'This connection could not be changed just now.'); }
    finally { setRelationshipBusy(false); }
  };

  const handlePhotoChange = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      onToast('Please choose a JPEG, PNG, or WebP image up to 5 MB.');
      return;
    }
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPseudonym.trim()) { onToast('Display name and pen name are required.'); return; }
    setSavingProfile(true);
    try {
      let avatar = editAvatar;
      if (selectedPhoto) avatar = (await profileApi.uploadAvatar(selectedPhoto)).avatar;
      await onUpdateProfile({ displayName: editName.trim(), pseudonym: editPseudonym.trim(), bio: editBio.trim(), currentlyFeeling: editFeeling.trim(), avatar, themeAccent: editAccent });
      setSelectedPhoto(null); setPhotoPreview(null); setIsEditModalOpen(false);
      onToast('Your scrapbook profile has been saved.');
    } catch (error: any) { onToast(error?.message || 'Your changes could not be saved just now.'); }
    finally { setSavingProfile(false); }
  };

  const userStories = (user.stories && user.stories.length > 0 ? user.stories : stories.filter((s) => s.isAuthor || s.authorPseudonym === user.pseudonym));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Reference B Scrapbook Header */}
      <div className="relative bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-10 shadow-lg mb-10 overflow-hidden">
        {/* Washi tape accents */}
        <div className="absolute -top-1 left-16 pointer-events-none">
          <WashiTapeStrip color="#F7DDE1" width="w-28" rotation="-rotate-2" />
        </div>
        <div className="absolute -top-1 right-20 pointer-events-none">
          <WashiTapeStrip color="#B7B99A" width="w-24" rotation="rotate-1" />
        </div>

        {/* Botanical illustrations in corners */}
        <div className="absolute top-4 right-6 opacity-75 hidden md:block pointer-events-none">
          <PressedFlower className="w-12 h-12 text-[#D8A0A5]" />
        </div>
        <div className="absolute bottom-4 left-6 opacity-60 hidden md:block pointer-events-none">
          <OliveBranch className="w-16 h-8 text-[#666747]" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Polaroid-style Avatar Frame */}
          <div className="polaroid-frame transform -rotate-2 hover:rotate-0 transition-transform duration-300 w-48 sm:w-56 shrink-0 relative">
            <div className="w-full h-44 sm:h-52 overflow-hidden bg-gray-100 rounded-sm">
              <img
                src={user.avatar || '/favicon.svg'}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pt-3 text-center">
              <span className="font-note text-lg text-[#44352F] block">
                @{user.pseudonym}
              </span>
              <span className="text-[10px] font-sans-clean text-[#666747]">
                sanctuary resident since {user.joinedDate}
              </span>
            </div>
            {/* Paper clip on Polaroid corner */}
            <div className="absolute -top-3 left-4">
              <PaperClip className="w-5 h-7 text-[#D8A0A5]" />
            </div>
          </div>

          {/* Profile Bio & Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-block">
              <h1 className="font-handwriting text-5xl sm:text-6xl text-[#B98289] font-normal leading-tight">
                a little about me
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="font-editorial text-2xl font-bold text-[#44352F]">
                {user.displayName}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7DDE1] text-[#B98289] font-serif">
                Gentle Soul
              </span>
            </div>

            <p className="font-body text-sm sm:text-base text-[#44352F]/90 max-w-xl leading-relaxed">
              {user.bio}
            </p>

            {/* Currently feeling card snippet */}
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9] text-xs font-serif text-[#666747]">
              <TeacupIcon className="w-4 h-4 text-[#B98289]" />
              <span>
                <strong>Currently feeling:</strong> {user.currentlyFeeling}
              </span>
            </div>

            {!isOwner && (
              <>
                <button onClick={() => relationship.following ? setConfirmUnfollow((open) => !open) : handleFollow()} disabled={relationshipBusy} className={`px-4 py-2 rounded-full font-serif text-sm ${relationship.following ? 'bg-[#B7B99A]' : 'bg-[#B98289] text-white'} disabled:opacity-60`}>
                  {relationship.following ? 'Following' : 'Follow'}
                </button>
                {confirmUnfollow && <div className="absolute mt-12 z-20 p-3 rounded-xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-lg text-xs font-serif"><p className="mb-2">Step away from this corner?</p><button onClick={() => { setConfirmUnfollow(false); handleFollow(); }} className="text-[#B98289] font-semibold">Unfollow</button></div>}
              </>
            )}

            {/* Stats row & Edit button */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3 border-t border-[#E9D9C9]/80 text-xs">
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{kindredStats ? kindredStats.storiesCount : '—'}</strong>
                <span className="text-[#666747]">Stories</span>
              </div>
              <span className="text-[#D8A0A5]">•</span>
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{kindredStats ? kindredStats.kindredCount : '—'}</strong>
                <button onClick={() => openKindredList('kindred')} className="text-[#666747] hover:text-[#B98289]">Kindred</button>
              </div>
              <span className="text-[#D8A0A5]">•</span>
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{kindredStats ? kindredStats.myKindredCount : '—'}</strong>
                <button onClick={() => openKindredList('my-kindred')} className="text-[#666747] hover:text-[#B98289]">My Kindred</button>
              </div>

              {isOwner && (
                <div className="md:ml-auto">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8F0] hover:bg-[#F7DDE1] text-[#44352F] border border-[#E9D9C9] transition-all cursor-pointer font-serif text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#B98289]" />
                    <span>Personalize scrapbook</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Scrapbook Navigation Tabs */}
      <div className="flex justify-center border-b border-[#E9D9C9] mb-8">
        <div className="flex gap-4 sm:gap-8 font-serif text-sm">
          <button
            onClick={() => setActiveTab('moodboard')}
            className={`pb-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'moodboard'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Scrapbook Moodboard</span>
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`pb-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stories'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Stories ({userStories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'collections'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Quiet Collections</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'border-[#B98289] text-[#B98289] font-bold'
                : 'border-transparent text-[#666747] hover:text-[#44352F]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Reflection Prompts</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PINTEREST-INSPIRED SCRAPBOOK MOODBOARD (REFERENCE B) */}
      {activeTab === 'moodboard' && (
        <EditableMoodboard
          initialCards={user.moodboard}
          pseudonym={user.pseudonym}
          isOwner={isOwner}
          onToast={onToast}
          onRequireAuth={onRequireAuth}
        />
      )}

      {/* TAB 2: MY STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {userStories.length > 0 ? (
            userStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onReadStory(story)}
                className="p-5 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] hover:border-[#D8A0A5] transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-sans-clean px-2 py-0.5 rounded bg-[#FFF8F0] border border-[#E9D9C9] text-[#666747]">
                    {story.category}
                  </span>
                  <span className="text-xs text-[#666747] font-sans-clean">{story.date}</span>
                </div>
                <h3 className="font-editorial font-bold text-xl text-[#44352F] hover:text-[#B98289]">
                  {story.title}
                </h3>
                <p className="font-body text-xs text-[#44352F]/80 line-clamp-2 mt-1">
                  {story.excerpt}
                </p>
                <div className="mt-3 pt-2 border-t border-[#E9D9C9] flex justify-between items-center text-xs text-[#666747]">
                  <span>{story.reactions.hearYou + story.reactions.feltThisToo} whispers</span>
                  <span className="text-[#B98289] font-serif font-medium">Read letter →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-[#FFFCF8] rounded-2xl border border-dashed border-[#E9D9C9]">
              <BookOpen className="w-8 h-8 text-[#B98289] mx-auto mb-2 opacity-50" />
              <p className="font-editorial text-lg text-[#44352F]">No shared stories under this pen yet</p>
              <p className="text-xs text-[#666747] font-body mt-1">
                Your voice is safe here whenever you feel ready.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUIET COLLECTIONS */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs">
            <Bookmark className="w-5 h-5 text-[#B98289] mb-3" />
            <h3 className="font-editorial font-bold text-lg text-[#44352F]">Midnight Solace</h3>
            <p className="text-xs font-body text-[#666747] mt-1 mb-4">
              Letters read during sleepless 3 AM hours that brought comfort.
            </p>
            <span className="text-xs font-note text-[#B98289]">4 saved letters</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs">
            <Bookmark className="w-5 h-5 text-[#B7B99A] mb-3" />
            <h3 className="font-editorial font-bold text-lg text-[#44352F]">Growing Gently</h3>
            <p className="text-xs font-body text-[#666747] mt-1 mb-4">
              Reflections on self-forgiveness, boundaries, and slow blooming.
            </p>
            <span className="text-xs font-note text-[#666747]">3 saved letters</span>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs">
            <Bookmark className="w-5 h-5 text-[#D8A0A5] mb-3" />
            <h3 className="font-editorial font-bold text-lg text-[#44352F]">Things That Broke My Heart</h3>
            <p className="text-xs font-body text-[#666747] mt-1 mb-4">
              Vulnerable essays on friendship loss and family wounds.
            </p>
            <span className="text-xs font-note text-[#B98289]">2 saved letters</span>
          </div>
        </div>
      )}

      {/* TAB 4: REFLECTION PROMPTS */}
      {activeTab === 'about' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {user.reflectionAnswers.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-[#FFFCF8] border border-[#E9D9C9] shadow-xs relative">
              <WashiTapeStrip color="#F7DDE1" width="w-20" rotation="-rotate-1" className="mb-2" />
              <h4 className="font-editorial text-lg font-bold text-[#44352F] mb-2">
                “{item.prompt}”
              </h4>
              <p className="font-body text-sm text-[#44352F]/90 italic leading-relaxed">
                “{item.answer}”
              </p>
            </div>
          ))}
        </div>
      )}

      {listType && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40" onClick={() => setListType(null)}>
          <div className="w-full max-w-xl max-h-[80vh] overflow-auto bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial font-bold text-2xl text-[#44352F]">{listType === 'kindred' ? 'Kindred' : 'My Kindred'}</h3>
              <button onClick={() => setListType(null)} className="text-[#666747]">×</button>
            </div>
            <input value={listSearch} onChange={(event) => setListSearch(event.target.value)} placeholder="Search this little circle" className="w-full p-2.5 mb-4 rounded-xl border border-[#E9D9C9] bg-white" />
            {listLoading && <p className="py-8 text-center font-serif text-[#666747]">Gathering the little circle…</p>}
            {listError && <p className="py-8 text-center font-serif text-[#B98289]">{listError}</p>}
            {!listLoading && !listError && kindredList.filter((item) => `${item.pseudonym} ${item.displayName}`.toLowerCase().includes(listSearch.toLowerCase())).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-[#E9D9C9]">
                <button onClick={() => onOpenProfile?.(item.pseudonym)}><img src={item.avatar || '/favicon.svg'} alt="" className="w-11 h-11 rounded-full object-cover bg-[#F7DDE1]" /></button>
                <button onClick={() => onOpenProfile?.(item.pseudonym)} className="flex-1 text-left"><p className="font-serif font-semibold">@{item.pseudonym}</p><p className="text-xs text-[#666747] line-clamp-1">{item.bio || 'A quiet soul in the sanctuary.'}</p></button>
                {item.mutualKindred && <span className="text-xs text-[#B98289]">Mutual Kindred</span>}
              </div>
            ))}
            {!listLoading && !listError && kindredList.length === 0 && <p className="py-8 text-center font-serif text-[#666747]">{listType === 'kindred' ? 'No one has found their way to this little corner yet.' : 'Your little circle is waiting to grow.'}</p>}
            {!listLoading && !listError && listHasMore && <button onClick={loadMoreKindred} className="w-full mt-4 py-2 rounded-xl border border-[#E9D9C9] text-[#B98289] font-serif hover:bg-[#F7DDE1]">Load more</button>}
          </div>
        </div>
      )}

      {/* Interactive Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E9D9C9] mb-4">
              <h3 className="font-editorial font-bold text-2xl text-[#44352F]">
                Personalize Your Scrapbook
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-[#666747] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans-clean">
              <div>
                <label className="block font-semibold text-[#44352F] mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44352F] mb-1">Pseudonym (@tag)</label>
                <input
                  type="text"
                  value={editPseudonym}
                  onChange={(e) => setEditPseudonym(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44352F] mb-1">Bio Note</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44352F] mb-1">Currently Feeling</label>
                <input
                  type="text"
                  value={editFeeling}
                  onChange={(e) => setEditFeeling(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
                />
              </div>

              {/* Gallery photo selector */}
              <div>
                <label className="block font-semibold text-[#44352F] mb-2">Profile photograph</label>
                <div className="flex items-center gap-4">
                  <img src={photoPreview || editAvatar || '/favicon.svg'} alt="Photo preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#D8A0A5]" />
                  <label className="px-3 py-2 rounded-xl border border-[#E9D9C9] bg-white text-[#44352F] cursor-pointer font-serif">
                    Upload from gallery
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handlePhotoChange(event.target.files?.[0])} />
                  </label>
                </div>
              </div>

              {/* Theme Accent */}
              <div>
                <label className="block font-semibold text-[#44352F] mb-2">Palette Accent</label>
                <div className="flex gap-3">
                  {themePresets.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAccent(color)}
                      className={`w-7 h-7 rounded-full border border-black/10 cursor-pointer ${
                        editAccent === color ? 'ring-2 ring-black/40 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E9D9C9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E9D9C9] text-[#666747] hover:bg-gray-50 cursor-pointer font-serif"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B98289] text-white hover:bg-[#A36C73] transition-colors cursor-pointer font-serif font-medium"
                >
                  {savingProfile ? 'Saving…' : 'Save Scrapbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
