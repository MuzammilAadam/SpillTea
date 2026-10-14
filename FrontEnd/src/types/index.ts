export type Category =
  | 'All'
  | 'Relationships'
  | 'Family'
  | 'Friendship'
  | 'Loneliness'
  | 'College & Career'
  | 'Self-growth'
  | 'Healing'
  | 'Life'
  | 'Unsent Letters';

export type StoryIntent = 'vent' | 'advice' | 'similar_experiences';

export type Mood = 'reflective' | 'melancholy' | 'hopeful' | 'overwhelmed' | 'peaceful' | 'tender';

export interface ReactionCounts {
  hearYou: number;
  feltThisToo: number;
  thankYou: number;
  sendingSupport: number;
}

export interface Comment {
  id: string;
  storyId: string;
  authorPseudonym: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  userLiked?: boolean;
  isPinned?: boolean;
  isStoryAuthor?: boolean;
  replies?: Comment[];
}

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorPseudonym: string;
  authorAvatar: string;
  date: string;
  category: Category;
  tags: string[];
  intent: StoryIntent;
  contentWarning?: string;
  reactions: ReactionCounts;
  userReactions: ('hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport')[];
  commentsCount: number;
  saved: boolean;
  readTime: string;
  image?: string;
  isPrivate?: boolean;
  isAuthor?: boolean;
  comments?: Comment[];
}

export type LetterCategory =
  | 'To My Younger Self'
  | 'Someone I Miss'
  | 'Things I Never Said'
  | 'Letters to the Future';

export interface UnsentLetter {
  id: string;
  recipient: string;
  title: string;
  content: string;
  date: string;
  category: LetterCategory;
  isPrivate: boolean;
  envelopeColor: string;
  stampStyle: string;
  washiColor: string;
  paperTexture?: string;
  authorPseudonym: string;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  category: Category;
  mood: Mood;
  intent: StoryIntent;
  isPrivate: boolean;
  contentWarning: string;
  lastSaved: string;
}

export interface MoodboardItem {
  id: string;
  type: 'image' | 'note' | 'quote' | 'prompt' | 'photo';
  title?: string;
  content: string;
  image?: string;
  author?: string;
  rotation?: string;
  washiTape?: boolean;
  color?: string;
  photoStyle?: 'polaroid' | 'tilted' | 'handwritten' | 'tape' | 'cream-frame';
  cardSize?: 'normal' | 'wide' | 'compact';
}

export interface UploadResponse {
  id: number;
  url: string;
  originalFilename?: string;
  contentType?: string;
  fileSize?: number;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  pseudonym: string;
  displayName: string;
  bio: string;
  avatar: string;
  themeAccent: string;
  joinedDate: string;
  currentlyFeeling: string;
  stats: {
    storiesShared: number;
    lettersPenciled: number;
    momentsEmpathized: number;
  };
  kindredStats?: {
    storiesCount: number;
    kindredCount: number;
    myKindredCount: number;
  };
  isSelf?: boolean;
  favoriteQuotes: { text: string; author: string }[];
  reflectionAnswers: { prompt: string; answer: string }[];
  moodboard: MoodboardItem[];
  stories?: Story[];
}

export interface KindredProfile {
  id: string;
  pseudonym: string;
  displayName: string;
  bio: string;
  avatar: string;
  following: boolean;
  mutualKindred: boolean;
}

export interface KindredPage {
  content: KindredProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PeopleSearchResult extends KindredProfile {
  kindredCount: number;
}

export interface NotificationItem {
  id: string;
  type: 'reply' | 'reaction' | 'saved_update' | 'comfort';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  storyId?: string;
  letterId?: string;
  commentId?: string;
  actorPseudonym?: string;
  actorAvatar?: string;
  actorId?: number;
  recipientId?: number;
}
