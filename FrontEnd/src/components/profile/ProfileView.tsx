import React, { useState } from 'react';
import { UserProfile, Story } from '../../types';
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

interface ProfileViewProps {
  user: UserProfile;
  stories: Story[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onReadStory: (story: Story) => void;
  onToast?: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stories,
  onUpdateProfile,
  onReadStory,
  onToast = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'moodboard' | 'stories' | 'collections' | 'about'>('moodboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user.displayName);
  const [editPseudonym, setEditPseudonym] = useState(user.pseudonym);
  const [editBio, setEditBio] = useState(user.bio);
  const [editFeeling, setEditFeeling] = useState(user.currentlyFeeling);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editAccent, setEditAccent] = useState(user.themeAccent);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  ];

  const themePresets = ['#D8A0A5', '#B98289', '#B7B99A', '#666747', '#E9D9C9'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: editName,
      pseudonym: editPseudonym,
      bio: editBio,
      currentlyFeeling: editFeeling,
      avatar: editAvatar,
      themeAccent: editAccent,
    });
    setIsEditModalOpen(false);
  };

  const userStories = stories.filter((s) => s.isAuthor || s.authorPseudonym === user.pseudonym);

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
                src={user.avatar}
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

            {/* Stats row & Edit button */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3 border-t border-[#E9D9C9]/80 text-xs">
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{user.stats.storiesShared}</strong>
                <span className="text-[#666747]">stories shared</span>
              </div>
              <span className="text-[#D8A0A5]">•</span>
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{user.stats.lettersPenciled}</strong>
                <span className="text-[#666747]">letters penciled</span>
              </div>
              <span className="text-[#D8A0A5]">•</span>
              <div className="flex items-center gap-1 font-serif text-[#44352F]">
                <strong>{user.stats.momentsEmpathized}</strong>
                <span className="text-[#666747]">whispers received</span>
              </div>

              <div className="md:ml-auto">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF8F0] hover:bg-[#F7DDE1] text-[#44352F] border border-[#E9D9C9] transition-all cursor-pointer font-serif text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#B98289]" />
                  <span>Personalize scrapbook</span>
                </button>
              </div>
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
          isOwner={true}
          onToast={onToast}
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

              {/* Avatar Preset Selector */}
              <div>
                <label className="block font-semibold text-[#44352F] mb-2">Polaroid Portrait Preset</label>
                <div className="flex gap-3">
                  {avatarPresets.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditAvatar(imgUrl)}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer ${
                        editAvatar === imgUrl ? 'border-[#B98289] ring-2 ring-[#B98289]/30' : 'border-gray-200'
                      }`}
                    >
                      <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
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
                  Save Scrapbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
