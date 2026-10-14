import React, { useState, useEffect, useCallback } from 'react';
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
import { NotificationsView } from './components/notifications/NotificationsView';
import { FloatingDoodles } from './components/common/FloatingDoodles';

// Modals & Drawers
import { StoryDetailModal } from './components/story/StoryDetailModal';
import { SupportModal } from './components/common/SupportModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { LoginRequiredModal } from './components/auth/LoginRequiredModal';

// Auth & API
import { useAuth } from './context/AuthContext';
import { storiesApi } from './api/stories';
import { lettersApi } from './api/letters';
import { profileApi } from './api/profile';
import { notificationsApi } from './api/notifications';
import { useNotificationStream } from './hooks/useNotificationStream';

export function App() {
  const { currentUser, isAuthenticated, logout, updateCurrentUserState, token } = useAuth();

  // Navigation View State
  const [currentView, setCurrentView] = useState<string>('home');
  const [initialSearchQuery, setInitialSearchQuery] = useState<string>('');
  const [promptToAnswer, setPromptToAnswer] = useState<string | null>(null);
  const [routeProfile, setRouteProfile] = useState<UserProfile | null>(null);
  const [routeProfileLoading, setRouteProfileLoading] = useState(false);
  const [routeProfileError, setRouteProfileError] = useState(false);

  const openProfile = useCallback(async (pseudonym: string) => {
    const encoded = encodeURIComponent(pseudonym);
    window.history.pushState({}, '', `/profile/${encoded}`);
    setCurrentView('profile-public'); setRouteProfileLoading(true); setRouteProfileError(false);
    try { setRouteProfile(await profileApi.getProfile(pseudonym)); }
    catch { setRouteProfile(null); setRouteProfileError(true); }
    finally { setRouteProfileLoading(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, []);

  useEffect(() => {
    const resolvePath = () => {
      const match = window.location.pathname.match(/^\/profile\/([^/]+)$/);
      if (!match) return;
      const pseudonym = decodeURIComponent(match[1]);
      openProfile(pseudonym);
    };
    window.addEventListener('popstate', resolvePath);
    resolvePath();
    return () => window.removeEventListener('popstate', resolvePath);
  }, [openProfile]);

  // Core Data States
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('spilltea_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [letters, setLetters] = useState<UnsentLetter[]>(() => {
    const saved = localStorage.getItem('spilltea_letters');
    return saved ? JSON.parse(saved) : INITIAL_LETTERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Active Modals & Overlays
  const [activeStoryModal, setActiveStoryModal] = useState<Story | null>(null);
  const [highlightCommentId, setHighlightCommentId] = useState<string | undefined>(undefined);
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth-guard modal state
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const [loginRequiredMessage, setLoginRequiredMessage] = useState<string>('Sign in to join gentle conversations.');
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

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

  const requireAuth = (action?: () => void, message?: string, destination?: string) => {
    if (!isAuthenticated) {
      setLoginRequiredMessage(message || 'Sign in to join this gentle sanctuary.');
      if (action) setPendingAction(() => action);
      if (destination) setPendingDestination(destination);
      setLoginRequiredOpen(true);
      return false;
    }
    if (action) action();
    return true;
  };

  const handleAuthSuccess = () => {
    showToast('Welcome to your journal sanctuary.');
    if (pendingDestination) {
      const dest = pendingDestination;
      setPendingDestination(null);
      setCurrentView(dest);
    }
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      act();
    }
  };

  // ── Real-time SSE Notifications ────────────────────────────────────────────

  const handleNewNotification = useCallback((notif: NotificationItem) => {
    setNotifications((prev) => {
      // Avoid duplicates
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [notif, ...prev];
    });
    // Show a brief toast for incoming notification
    showToast(`✦ ${notif.title}: ${notif.description}`);
  }, []);

  useNotificationStream({
    token,
    isAuthenticated,
    onNewNotification: handleNewNotification,
  });

  // Sync initial feed from Backend API
  useEffect(() => {
    let mounted = true;
    const fetchRemoteData = async () => {
      try {
        const feed = await storiesApi.getStories();
        if (mounted && feed && feed.content) {
          // The backend is authoritative: an empty feed is a real empty feed.
          setStories(feed.content);
          localStorage.setItem('spilltea_stories', JSON.stringify(feed.content));
        }
      } catch (err) {
        console.warn('Backend offline or unreachable, using local journal data:', err);
      }

      try {
        const letterFeed = await lettersApi.getPublicLetters();
        if (mounted && letterFeed && letterFeed.content && letterFeed.content.length > 0) {
          const remoteIds = new Set(letterFeed.content.map(l => String(l.id)));
          const remainingLocal = letters.filter(l => !remoteIds.has(String(l.id)));
          setLetters([...letterFeed.content, ...remainingLocal]);
        }
      } catch (err) {
        console.warn('Backend offline or unreachable, using local letters:', err);
      }

      if (isAuthenticated) {
        try {
          const remoteNotifs = await notificationsApi.getNotifications();
          if (mounted && remoteNotifs && remoteNotifs.length > 0) {
            setNotifications(remoteNotifs);
          }
        } catch (err) {
          console.warn('Could not load remote notifications:', err);
        }
      }
    };

    fetchRemoteData();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  // --- ACTIONS ---

  // Toggle bookmark/save
  const handleToggleSave = async (storyId: string) => {
    if (!requireAuth(() => {}, 'Sign in to save stories to your private keepsakes chest.')) return;

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

    try {
      await storiesApi.bookmarkStory(storyId);
    } catch (err) {
      console.warn('Failed to sync bookmark to server:', err);
    }
  };

  // Supportive whisper reaction toggle
  const handleReaction = async (
    storyId: string,
    reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport'
  ) => {
    if (!requireAuth(() => {}, 'Sign in to send a gentle whisper of support to the author.')) return;

    const updated = stories.map((s) => {
      if (s.id === storyId) {
        const userReactions = s.userReactions || [];
        const hasReacted = userReactions.includes(reactionType);
        const newUserReactions = hasReacted
          ? userReactions.filter((r) => r !== reactionType)
          : [...userReactions, reactionType];

        const newCount = hasReacted
          ? Math.max(0, (s.reactions ? s.reactions[reactionType] : 0) - 1)
          : (s.reactions ? s.reactions[reactionType] : 0) + 1;

        const newReactions = {
          ...(s.reactions || { hearYou: 0, feltThisToo: 0, thankYou: 0, sendingSupport: 0 }),
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

    try {
      await storiesApi.toggleReaction(storyId, reactionType);
    } catch (err) {
      console.warn('Failed to sync reaction to server:', err);
    }
  };

  // Add Comment / Reply
  const handleAddComment = async (storyId: string, content: string, parentCommentId?: string) => {
    if (!requireAuth(() => {}, 'Sign in to share your heartfelt response with the author.')) return;

    const newCommentId = `comment-${Date.now()}`;
    const newComment = {
      id: newCommentId,
      storyId,
      authorPseudonym: currentUser.pseudonym,
      authorAvatar: currentUser.avatar,
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

    try {
      await storiesApi.addComment(storyId, content, parentCommentId);
    } catch (err) {
      console.warn('Failed to post comment to server:', err);
    }
  };

  // Like comment
  const handleLikeComment = async (storyId: string, commentId: string) => {
    if (!requireAuth(() => {}, 'Sign in to appreciate a fellow soul\'s words.')) return;

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

    try {
      await storiesApi.toggleCommentLike(commentId);
    } catch (err) {
      console.warn('Failed to sync comment like:', err);
    }
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
  const handlePublishStory = async (storyData: any) => {
    if (!isAuthenticated) {
      // Preserve draft in localStorage so visitor never loses their words
      localStorage.setItem('spilltea_draft', JSON.stringify({
        title: storyData.title,
        content: storyData.content,
        category: storyData.category,
        mood: storyData.mood,
        intent: storyData.intent,
        isPrivate: storyData.isPrivate,
      }));
      setPendingDestination('write');
      setPendingAction(null); // Never silently publish without explicit user click
      setLoginRequiredMessage('Sign in to share your story. Your words are waiting safely on your desk.');
      setLoginRequiredOpen(true);
      return;
    }

    let createdStory: Story;
    try {
      const res = await storiesApi.createStory({
        ...storyData,
        displayMode: storyData.isAnonymous ? 'ANONYMOUS' : 'PSEUDONYM',
      });
      createdStory = res;
    } catch (err) {
      console.warn('Server publish failed, saving locally:', err);
      createdStory = {
        ...storyData,
        id: `story-${Date.now()}`,
        reactions: { hearYou: 1, feltThisToo: 0, thankYou: 0, sendingSupport: 1 },
        userReactions: ['hearYou'],
        commentsCount: 0,
        saved: false,
        comments: [],
        isAuthor: true,
      };
    }

    const newStories = [createdStory, ...stories];
    updateStories(newStories);
    updateCurrentUserState({
      stats: {
        ...currentUser.stats,
        storiesShared: (currentUser.stats?.storiesShared || 0) + 1,
      },
    });

    showToast('Your story has been released gently to the journal feed.');
    setActiveStoryModal(createdStory);
    setCurrentView('home');
  };

  // Publish / Pencil unsent letter
  const handlePublishLetter = async (letterData: any) => {
    if (!isAuthenticated) {
      // Preserve letter draft
      localStorage.setItem('spilltea_draft', JSON.stringify({
        title: letterData.title,
        content: letterData.content,
        recipient: letterData.recipient,
        category: letterData.category,
        isPrivate: letterData.isPrivate,
      }));
      setPendingDestination('write');
      setPendingAction(null);
      setLoginRequiredMessage('Sign in to release your unsent letter into the ether.');
      setLoginRequiredOpen(true);
      return;
    }

    let createdLetter: UnsentLetter;
    try {
      const res = await lettersApi.createLetter({
        ...letterData,
      });
      createdLetter = res;
    } catch (err) {
      console.warn('Server letter post failed, saving locally:', err);
      createdLetter = {
        ...letterData,
        id: `letter-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    }

    const newLetters = [createdLetter, ...letters];
    updateLetters(newLetters);
    updateCurrentUserState({
      stats: {
        ...currentUser.stats,
        lettersPenciled: (currentUser.stats?.lettersPenciled || 0) + 1,
      },
    });

    showToast(
      createdLetter.isPrivate
        ? 'Letter sealed safely in your private cedar drawer.'
        : 'Letter released anonymously into the ether.'
    );
    setCurrentView('unsent-letters');
  };

  // Delete letter
  const handleDeleteLetter = async (letterId: string) => {
    const filtered = letters.filter((l) => l.id !== letterId);
    updateLetters(filtered);
    showToast('The letter has been burned and removed.');
    if (isAuthenticated) {
      try {
        await lettersApi.deleteLetter(letterId);
      } catch (err) {
        console.warn('Failed to delete letter from server:', err);
      }
    }
  };

  // Letter reaction handler
  const handleReactLetter = async (letterId: string, type: string) => {
    if (!requireAuth(() => {}, 'Sign in to whisper support to this unsent letter.')) return;
    try {
      await lettersApi.toggleReaction(letterId, type);
      showToast('You felt this too — whispered softly to the author.');
    } catch (err) {
      console.warn('Failed to react to letter on server:', err);
    }
  };

  // Letter thoughtful reply handler
  const handleReplyLetter = async (letterId: string, content: string) => {
    if (!requireAuth(() => {}, 'Sign in to leave a thoughtful response to this letter.')) return;
    try {
      await lettersApi.addReply(letterId, content);
      showToast('Your thoughtful response has been gently delivered.');
    } catch (err) {
      console.warn('Failed to reply to letter on server:', err);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    showToast('Draft safely recorded in your desk drawer.');
  };

  // Update profile
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!isAuthenticated) return;
    const saved = await profileApi.updateProfile(updated);
    updateCurrentUserState(saved);
    setRouteProfile((profile) => profile?.isSelf ? saved : profile);
  };

  // Reset Session (Prototype feature)
  const handleResetSession = () => {
    localStorage.removeItem('spilltea_stories');
    localStorage.removeItem('spilltea_letters');
    localStorage.removeItem('spilltea_user');
    localStorage.removeItem('spilltea_draft');
    setStories(INITIAL_STORIES);
    setLetters(INITIAL_LETTERS);
    updateCurrentUserState(CURRENT_USER);
    showToast('Session and temporary drafts restored to clean defaults.');
  };

  // Notification click
  const handleNotificationClick = async (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationsOpen(false);

    if (isAuthenticated) {
      try {
        await notificationsApi.markAsRead(notif.id);
      } catch (err) {
        console.warn('Could not mark notification read on server:', err);
      }
    }

    if (notif.storyId) {
      let story = stories.find((s) => s.id === notif.storyId);
      if (!story && isAuthenticated) {
        try {
          story = await storiesApi.getStory(notif.storyId);
        } catch (err) {
          console.warn('Could not find story:', err);
        }
      }
      if (story) {
        setHighlightCommentId(notif.commentId);
        setActiveStoryModal(story);
      } else {
        showToast('Story may have been gently tucked away or deleted.');
      }
    } else if (notif.letterId) {
      setActiveLetterId(notif.letterId);
      setCurrentView('unsent-letters');
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
    if (isAuthenticated) {
      try {
        await notificationsApi.markAllAsRead();
      } catch (err) {
        console.warn('Could not mark all notifications read on server:', err);
      }
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isAuthenticated) {
      try {
        await notificationsApi.markAsRead(id);
      } catch (err) {
        console.warn('Could not mark notification read on server:', err);
      }
    }
  };

  const handleNavbarNavigate = (view: string) => {
    if (view === 'myspace' && !isAuthenticated) {
      requireAuth(() => setCurrentView('myspace'), 'Sign in to open your personal cedar drawer.', 'myspace');
      return;
    }
    setCurrentView(view);
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
        onNavigate={handleNavbarNavigate}
        currentUser={currentUser}
        onOpenSearch={() => setCurrentView('explore')}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onNotificationClick={handleNotificationClick}
      />

      {/* 2. Sage-Green Main Navbar (Reference A) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavbarNavigate}
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
            onOpenProfile={openProfile}
          />
        )}

        {currentView === 'explore' && (
          <ExploreView
            stories={stories}
            onReadStory={(s) => setActiveStoryModal(s)}
            onToggleSave={handleToggleSave}
            onReaction={handleReaction}
            initialSearchQuery={initialSearchQuery}
            isAuthenticated={isAuthenticated}
            onOpenProfile={openProfile}
            onRefreshUser={async () => { await profileApi.getMyProfile().then(updateCurrentUserState); }}
            onToast={showToast}
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
            onReactLetter={handleReactLetter}
            onReplyLetter={handleReplyLetter}
            initialLetterId={activeLetterId}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            user={currentUser}
            stories={stories}
            onUpdateProfile={handleUpdateProfile}
            onReadStory={(s) => setActiveStoryModal(s)}
            onToast={showToast}
            onOpenProfile={openProfile}
          />
        )}

        {currentView === 'profile-public' && (
          routeProfileLoading ? <div className="py-24 text-center font-serif text-[#666747]">Opening this little corner…</div> :
          routeProfileError || !routeProfile ? <div className="max-w-xl mx-auto py-24 px-6 text-center"><h2 className="font-handwriting text-4xl text-[#B98289]">This little corner couldn’t be found</h2><p className="mt-3 font-serif text-[#666747]">The profile may have moved, gone private, or never existed.</p><button onClick={() => handleNavbarNavigate('home')} className="mt-6 px-5 py-2 rounded-full bg-[#B98289] text-white font-serif">Return home</button></div> :
          <ProfileView user={routeProfile} stories={routeProfile.stories || []} onUpdateProfile={handleUpdateProfile} onReadStory={(s) => setActiveStoryModal(s)} onToast={showToast} onOpenProfile={openProfile} />
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
            user={currentUser}
            stories={stories}
            letters={letters}
            onOpenStory={(s) => setActiveStoryModal(s)}
            onOpenLetter={(l) => {}}
            onWriteClick={() => setCurrentView('write')}
            onOpenSupport={() => setIsSupportModalOpen(true)}
            onResetSession={handleResetSession}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onMarkAsRead={handleMarkNotificationAsRead}
            onBack={() => setCurrentView('home')}
          />
        )}
      </div>

      {/* 4. Scrapbook Footer */}
      <Footer
        onNavigate={handleNavbarNavigate}
        onOpenSupport={() => setIsSupportModalOpen(true)}
      />

      {/* 5. Modals & Notifications Drawer */}
      <StoryDetailModal
        story={activeStoryModal}
        onClose={() => {
          setActiveStoryModal(null);
          setHighlightCommentId(undefined);
        }}
        onToggleSave={handleToggleSave}
        onReaction={handleReaction}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onPinComment={handlePinComment}
        onReportStory={handleReportStory}
        highlightCommentId={highlightCommentId}
        onOpenProfile={openProfile}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Auth Guard Modal */}
      <LoginRequiredModal
        isOpen={loginRequiredOpen}
        onClose={() => setLoginRequiredOpen(false)}
        onLoginClick={() => {
          setLoginRequiredOpen(false);
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onRegisterClick={() => {
          setLoginRequiredOpen(false);
          setAuthModalMode('register');
          setIsAuthModalOpen(true);
        }}
        actionMessage={loginRequiredMessage}
      />

      {/* Gentle feedback toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default App;
