import React, { useState } from 'react';
import { Story, UnsentLetter, UserProfile, NotificationItem } from './types';
import {
  INITIAL_STORIES,
  INITIAL_LETTERS,
  CURRENT_USER,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';

// Layout
import { AnnouncementHeader } from './components/layout/AnnouncementHeader';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Views
import { HomeView } from './components/home/HomeView';
import { ExploreView } from './components/explore/ExploreView';
import { WriteLetterView } from './components/write/WriteLetterView';
import { UnsentLettersView } from './components/letters/UnsentLettersView';
import { ProfileView } from './components/profile/ProfileView';
import { SavedView } from './components/saved/SavedView';
import { MySpaceView } from './components/myspace/MySpaceView';

// Modals & Drawers
import { StoryDetailModal } from './components/story/StoryDetailModal';
import { SupportModal } from './components/common/SupportModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { Toast } from './components/common/Toast';

export function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [promptToAnswer, setPromptToAnswer] = useState<string | null>(null);

  // Core Data States
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('spilltea_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [letters, setLetters] = useState<UnsentLetter[]>(() => {
    const saved = localStorage.getItem('spilltea_letters');
    return saved ? JSON.parse(saved) : INITIAL_LETTERS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('spilltea_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Active Modals & Overlays
  const [activeStoryModal, setActiveStoryModal] = useState<Story | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save stories to local storage
  const updateStories = (newStories: Story[]) => {
    setStories(newStories);
    localStorage.setItem('spilltea_stories', JSON.stringify(newStories));
  };

  const updateLetters = (newLetters: UnsentLetter[]) => {
    setLetters(newLetters);
    localStorage.setItem('spilltea_letters', JSON.stringify(newLetters));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // --- ACTIONS ---

  // Toggle bookmark/save
  const handleToggleSave = (storyId: string) => {
    const updated = stories.map((s) => {
      if (s.id === storyId) {
        const nextSaved = !s.saved;
        showToast(nextSaved ? 'Saved quietly in your keepsakes chest.' : 'Removed from saved keepsakes.');
        return { ...s, saved: nextSaved };
      }
      return s;
    });
    updateStories(updated);
    if (activeStoryModal && activeStoryModal.id === storyId) {
      setActiveStoryModal((prev) => (prev ? { ...prev, saved: !prev.saved } : null));
    }
  };

  // Supportive whisper reaction toggle
  const handleReaction = (
    storyId: string,
    reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport'
  ) => {
    const updated = stories.map((s) => {
      if (s.id === storyId) {
        const userReactions = s.userReactions || [];
        const hasReacted = userReactions.includes(reactionType);
        const newUserReactions = hasReacted
          ? userReactions.filter((r) => r !== reactionType)
          : [...userReactions, reactionType];

        const newCount = hasReacted
          ? Math.max(0, s.reactions[reactionType] - 1)
          : s.reactions[reactionType] + 1;

        const newReactions = {
          ...s.reactions,
          [reactionType]: newCount,
        };

        showToast(hasReacted ? 'Whisper withdrawn softly.' : 'Your whisper was gently delivered to the author.');

        return {
          ...s,
          reactions: newReactions,
          userReactions: newUserReactions,
        };
      }
      return s;
    });

    updateStories(updated);
    if (activeStoryModal && activeStoryModal.id === storyId) {
      const current = updated.find((s) => s.id === storyId);
      if (current) setActiveStoryModal(current);
    }
  };

  // Add Comment / Reply
  const handleAddComment = (storyId: string, content: string, parentCommentId?: string) => {
    const newCommentId = `comment-${Date.now()}`;
    const newComment = {
      id: newCommentId,
      storyId,
      authorPseudonym: user.pseudonym,
      authorAvatar: user.avatar,
      content,
      timestamp: 'Just now',
      likes: 0,
      userLiked: false,
      isStoryAuthor: false,
    };

    const updated = stories.map((s) => {
      if (s.id === storyId) {
        let comments = s.comments ? [...s.comments] : [];
        if (parentCommentId) {
          // append nested reply
          comments = comments.map((c) => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          });
        } else {
          comments.unshift(newComment);
        }

        return {
          ...s,
          comments,
          commentsCount: (s.commentsCount || 0) + 1,
        };
      }
      return s;
    });

    updateStories(updated);
    const updatedActive = updated.find((s) => s.id === storyId);
    if (updatedActive) setActiveStoryModal(updatedActive);
    showToast('Your heartfelt whisper has been penciled onto the page.');
  };

  // Like comment
  const handleLikeComment = (storyId: string, commentId: string) => {
    const updated = stories.map((s) => {
      if (s.id === storyId && s.comments) {
        const comments = s.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: c.userLiked ? c.likes - 1 : c.likes + 1,
              userLiked: !c.userLiked,
            };
          }
          return c;
        });
        return { ...s, comments };
      }
      return s;
    });
    updateStories(updated);
    const updatedActive = updated.find((s) => s.id === storyId);
    if (updatedActive) setActiveStoryModal(updatedActive);
  };

  // Pin comment (Author action)
  const handlePinComment = (storyId: string, commentId: string) => {
    const updated = stories.map((s) => {
      if (s.id === storyId && s.comments) {
        const comments = s.comments.map((c) => ({
          ...c,
          isPinned: c.id === commentId ? !c.isPinned : false,
        }));
        return { ...s, comments };
      }
      return s;
    });
    updateStories(updated);
    const updatedActive = updated.find((s) => s.id === storyId);
    if (updatedActive) setActiveStoryModal(updatedActive);
    showToast('Reply pinned for its gentle solace.');
  };

  // Report story
  const handleReportStory = (storyId: string, reason: string) => {
    showToast(`Thank you for keeping this space safe. We've received your note on: "${reason}".`);
  };

  // Publish new story
  const handlePublishStory = (storyData: any) => {
    const newStory: Story = {
      ...storyData,
      id: `story-${Date.now()}`,
      reactions: { hearYou: 1, feltThisToo: 0, thankYou: 0, sendingSupport: 1 },
      userReactions: ['hearYou'],
      commentsCount: 0,
      saved: false,
      comments: [],
      isAuthor: true,
    };

    const newStories = [newStory, ...stories];
    updateStories(newStories);
    setUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        storiesShared: prev.stats.storiesShared + 1,
      },
    }));

    showToast('Your story has been released gently to the journal feed.');
    setActiveStoryModal(newStory);
    setCurrentView('home');
  };

  // Publish / Pencil unsent letter
  const handlePublishLetter = (letterData: any) => {
    const newLetter: UnsentLetter = {
      ...letterData,
      id: `letter-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    const newLetters = [newLetter, ...letters];
    updateLetters(newLetters);
    setUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        lettersPenciled: prev.stats.lettersPenciled + 1,
      },
    }));

    showToast(
      newLetter.isPrivate
        ? 'Letter sealed safely in your private cedar drawer.'
        : 'Letter released anonymously into the ether.'
    );
    setCurrentView('unsent-letters');
  };

  // Delete letter
  const handleDeleteLetter = (letterId: string) => {
    const filtered = letters.filter((l) => l.id !== letterId);
    updateLetters(filtered);
    showToast('The letter has been burned and removed.');
  };

  // Save Draft
  const handleSaveDraft = () => {
    showToast('Draft safely recorded in your desk drawer.');
  };

  // Update profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('spilltea_user', JSON.stringify(newUser));
    showToast('Your scrapbook profile has been personalized.');
  };

  // Reset Session (Prototype feature)
  const handleResetSession = () => {
    localStorage.removeItem('spilltea_stories');
    localStorage.removeItem('spilltea_letters');
    localStorage.removeItem('spilltea_user');
    localStorage.removeItem('spilltea_draft');
    setStories(INITIAL_STORIES);
    setLetters(INITIAL_LETTERS);
    setUser(CURRENT_USER);
    showToast('Session and temporary drafts restored to clean defaults.');
  };

  // Notification click
  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);
    if (notif.storyId) {
      const found = stories.find((s) => s.id === notif.storyId);
      if (found) {
        setActiveStoryModal(found);
      }
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const savedCount = stories.filter((s) => s.saved).length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#44352F] paper-texture">
      {/* 1. Top Announcement Header */}
      <AnnouncementHeader
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onNavigate={(v) => setCurrentView(v)}
        currentUser={user}
        onOpenSearch={() => {
          setCurrentView('explore');
        }}
      />

      {/* 2. Sage-Green Main Navbar (Reference A) */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        savedCount={savedCount}
      />

      {/* 3. Main Routed View Area */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomeView
            stories={stories}
            onReadStory={(s) => setActiveStoryModal(s)}
            onToggleSave={handleToggleSave}
            onReaction={handleReaction}
            onWriteClick={() => {
              setPromptToAnswer(null);
              setCurrentView('write');
            }}
            onExploreClick={() => setCurrentView('explore')}
            onWritePrompt={(promptText) => {
              setPromptToAnswer(promptText);
              setCurrentView('write');
            }}
          />
        )}

        {currentView === 'explore' && (
          <ExploreView
            stories={stories}
            onReadStory={(s) => setActiveStoryModal(s)}
            onToggleSave={handleToggleSave}
            onReaction={handleReaction}
            initialSearchQuery={initialSearchQuery}
          />
        )}

        {currentView === 'write' && (
          <WriteLetterView
            onPublishStory={handlePublishStory}
            onSaveDraft={handleSaveDraft}
            onPublishLetter={handlePublishLetter}
            initialPrompt={promptToAnswer}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'unsent-letters' && (
          <UnsentLettersView
            letters={letters}
            onOpenLetter={(l) => {}}
            onNewLetter={() => setCurrentView('write')}
            onDeleteLetter={handleDeleteLetter}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={user}
            stories={stories}
            onUpdateProfile={handleUpdateProfile}
            onReadStory={(s) => setActiveStoryModal(s)}
          />
        )}

        {currentView === 'saved' && (
          <SavedView
            stories={stories}
            onReadStory={(s) => setActiveStoryModal(s)}
            onToggleSave={handleToggleSave}
            onReaction={handleReaction}
            onExplore={() => setCurrentView('explore')}
          />
        )}

        {currentView === 'myspace' && (
          <MySpaceView
            user={user}
            stories={stories}
            letters={letters}
            onOpenStory={(s) => setActiveStoryModal(s)}
            onOpenLetter={(l) => {
              // open letter
            }}
            onWriteClick={() => setCurrentView('write')}
            onOpenSupport={() => setIsSupportModalOpen(true)}
            onResetSession={handleResetSession}
          />
        )}
      </div>

      {/* 4. Scrapbook Footer */}
      <Footer
        onNavigate={(v) => setCurrentView(v)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      {/* 5. Modals & Notifications Drawer */}
      <StoryDetailModal
        story={activeStoryModal}
        onClose={() => setActiveStoryModal(null)}
        onToggleSave={handleToggleSave}
        onReaction={handleReaction}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onPinComment={handlePinComment}
        onReportStory={handleReportStory}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onNotificationClick={handleNotificationClick}
      />

      {/* Gentle feedback toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default App;
