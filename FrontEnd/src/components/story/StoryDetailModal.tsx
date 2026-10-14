import React, { useState } from 'react';
import { Story, Comment } from '../../types';
import {
  X,
  Bookmark,
  Heart,
  MessageCircle,
  Flag,
  Share2,
  AlertTriangle,
  Pin,
  Reply,
  Send,
  CornerDownRight,
  Shield,
  Check,
} from 'lucide-react';
import { TeacupIcon, PressedFlower, WashiTapeStrip } from '../common/Botanicals';

interface StoryDetailModalProps {
  story: Story | null;
  onClose: () => void;
  onToggleSave: (storyId: string) => void;
  onReaction: (
    storyId: string,
    reactionType: 'hearYou' | 'feltThisToo' | 'thankYou' | 'sendingSupport'
  ) => void;
  onAddComment: (storyId: string, content: string, parentCommentId?: string) => void;
  onLikeComment: (storyId: string, commentId: string) => void;
  onPinComment: (storyId: string, commentId: string) => void;
  onReportStory: (storyId: string, reason: string) => void;
  highlightCommentId?: string;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  onClose,
  onToggleSave,
  onReaction,
  onAddComment,
  onLikeComment,
  onPinComment,
  onReportStory,
  highlightCommentId,
}) => {
  if (!story) return null;

  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Harassment or harmful content');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    if (highlightCommentId && story) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`comment-${highlightCommentId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [highlightCommentId, story]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(story.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddComment(story.id, replyText.trim(), parentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleConfirmReport = () => {
    onReportStory(story.id, reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportModalOpen(false);
    }, 2000);
  };

  const getIntentBadge = () => {
    switch (story.intent) {
      case 'vent':
        return { label: 'The author is just venting • Please offer gentle presence over advice', bg: 'bg-[#F7DDE1]/60', text: 'text-[#B98289]' };
      case 'advice':
        return { label: 'The author is seeking gentle perspectives & kind advice', bg: 'bg-[#B7B99A]/30', text: 'text-[#666747]' };
      case 'similar_experiences':
        return { label: 'The author would love to hear similar experiences', bg: 'bg-[#E9D9C9]/50', text: 'text-[#44352F]' };
      default:
        return null;
    }
  };

  const intentInfo = getIntentBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] my-8 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top washi tape accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <WashiTapeStrip color="#F7DDE1" width="w-32" rotation="-rotate-1" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E9D9C9] bg-[#FFF8F0]/80">
          <div className="flex items-center gap-3">
            <img
              src={story.authorAvatar}
              alt={story.authorPseudonym}
              className="w-10 h-10 rounded-full object-cover border border-[#D8A0A5]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#44352F]">
                  {story.authorPseudonym}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFFCF8] border border-[#E9D9C9] text-[#666747]">
                  {story.category}
                </span>
              </div>
              <div className="text-xs text-[#666747] font-sans-clean">
                {story.date} • {story.readTime}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(story.id)}
              className={`p-2 rounded-full border border-[#E9D9C9] transition-colors cursor-pointer ${
                story.saved ? 'bg-[#F7DDE1] text-[#B98289]' : 'hover:bg-[#FFF8F0] text-[#666747]'
              }`}
              title={story.saved ? 'Remove bookmark' : 'Bookmark letter'}
            >
              <Bookmark className={`w-4 h-4 ${story.saved ? 'fill-[#B98289]' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-[#E9D9C9] hover:bg-[#FFF8F0] text-[#666747] transition-colors cursor-pointer"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#666747]" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-full border border-[#E9D9C9] hover:bg-[#FFF8F0] text-[#666747] transition-colors cursor-pointer"
              title="Report content"
            >
              <Flag className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F7DDE1]/40 text-[#44352F] transition-colors cursor-pointer ml-1"
              aria-label="Close letter"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 flex-1">
          {/* Stated Author Need / Intent */}
          {intentInfo && (
            <div className={`p-3 rounded-xl border border-[#E9D9C9] ${intentInfo.bg} ${intentInfo.text} text-xs font-sans-clean font-medium flex items-center gap-2`}>
              <TeacupIcon className="w-4 h-4 shrink-0" />
              <span>{intentInfo.label}</span>
            </div>
          )}

          {/* Content Warning if present */}
          {story.contentWarning && (
            <div className="p-3 rounded-xl bg-[#F7DDE1]/40 border border-[#D8A0A5] text-xs text-[#44352F] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B98289] shrink-0" />
              <span>Content Warning: {story.contentWarning}</span>
            </div>
          )}

          {/* Story Title & Main Long-form Text */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#44352F] leading-tight">
              {story.title}
            </h1>

            {story.image && (
              <div className="rounded-xl overflow-hidden border border-[#E9D9C9] my-4 shadow-xs max-h-80">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-stone max-w-none text-base sm:text-lg font-body leading-relaxed text-[#44352F]/90 space-y-4 whitespace-pre-line pt-2">
              {story.content}
            </div>
          </div>

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E9D9C9]">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-note px-2.5 py-1 rounded bg-[#FFF8F0] border border-[#E9D9C9] text-[#666747]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Supportive Reaction Controls (Line icons and text labels per requirements) */}
          <div className="p-5 rounded-2xl bg-[#FFF8F0] border border-[#E9D9C9] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-editorial font-bold text-base text-[#44352F]">
                Supportive Whispers
              </h4>
              <span className="font-note text-xs text-[#666747]">
                let the author know their words were received
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans-clean">
              <button
                onClick={() => onReaction(story.id, 'hearYou')}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  story.userReactions?.includes('hearYou')
                    ? 'bg-[#F7DDE1] border-[#B98289] text-[#B98289] font-semibold'
                    : 'bg-white border-[#E9D9C9] hover:bg-[#F7DDE1]/30 text-[#44352F]'
                }`}
              >
                <Heart className="w-4 h-4 text-[#B98289]" />
                <span>I hear you</span>
                <span className="text-[11px] font-mono text-[#666747]">{story.reactions.hearYou}</span>
              </button>

              <button
                onClick={() => onReaction(story.id, 'feltThisToo')}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  story.userReactions?.includes('feltThisToo')
                    ? 'bg-[#F7DDE1] border-[#B98289] text-[#B98289] font-semibold'
                    : 'bg-white border-[#E9D9C9] hover:bg-[#F7DDE1]/30 text-[#44352F]'
                }`}
              >
                <TeacupIcon className="w-4 h-4 text-[#B98289]" />
                <span>I've felt this too</span>
                <span className="text-[11px] font-mono text-[#666747]">{story.reactions.feltThisToo}</span>
              </button>

              <button
                onClick={() => onReaction(story.id, 'thankYou')}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  story.userReactions?.includes('thankYou')
                    ? 'bg-[#F7DDE1] border-[#B98289] text-[#B98289] font-semibold'
                    : 'bg-white border-[#E9D9C9] hover:bg-[#F7DDE1]/30 text-[#44352F]'
                }`}
              >
                <PressedFlower className="w-4 h-4 text-[#B98289]" />
                <span>Thank you for sharing</span>
                <span className="text-[11px] font-mono text-[#666747]">{story.reactions.thankYou}</span>
              </button>

              <button
                onClick={() => onReaction(story.id, 'sendingSupport')}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  story.userReactions?.includes('sendingSupport')
                    ? 'bg-[#F7DDE1] border-[#B98289] text-[#B98289] font-semibold'
                    : 'bg-white border-[#E9D9C9] hover:bg-[#F7DDE1]/30 text-[#44352F]'
                }`}
              >
                <Shield className="w-4 h-4 text-[#666747]" />
                <span>Sending support</span>
                <span className="text-[11px] font-mono text-[#666747]">{story.reactions.sendingSupport}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-4 border-t border-[#E9D9C9]">
            <div className="flex items-center justify-between">
              <h3 className="font-editorial font-bold text-2xl text-[#44352F] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#B98289]" />
                <span>Heartfelt Reflections ({story.comments?.length || 0})</span>
              </h3>
              <span className="text-xs font-sans-clean text-[#666747]">
                Gentle tone required
              </span>
            </div>

            {/* Comment Composer */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Offer a kind word, shared memory, or gentle reassurance..."
                  rows={3}
                  className="w-full p-4 rounded-xl border border-[#E9D9C9] bg-white text-sm font-body text-[#44352F] placeholder-[#666747]/60 focus:outline-none focus:border-[#B98289] focus:ring-1 focus:ring-[#B98289] resize-none"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-[#666747] font-note">
                  Posting anonymously as @TeaAndWildflowers
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#B7B99A] hover:bg-[#666747] text-white font-serif font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send whisper</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {story.comments && story.comments.length > 0 ? (
                story.comments.map((comment) => {
                  const isHighlighted = highlightCommentId === comment.id;
                  return (
                    <div
                      id={`comment-${comment.id}`}
                      key={comment.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isHighlighted
                          ? 'bg-[#FFF0F2] border-[#B98289] ring-2 ring-[#B98289]/60 shadow-md'
                          : comment.isPinned
                          ? 'bg-[#FFF8F0] border-[#D8A0A5] shadow-xs'
                          : 'bg-white border-[#E9D9C9]'
                      }`}
                    >
                    {/* Pinned by author badge */}
                    {comment.isPinned && (
                      <div className="flex items-center gap-1.5 text-xs text-[#B98289] font-medium mb-2 pb-1 border-b border-[#E9D9C9]">
                        <Pin className="w-3.5 h-3.5" />
                        <span>Pinned by author as especially comforting</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorPseudonym}
                          className="w-6 h-6 rounded-full object-cover border border-[#D8A0A5]"
                        />
                        <span className="font-serif font-semibold text-xs text-[#44352F]">
                          {comment.authorPseudonym}
                        </span>
                        {comment.isStoryAuthor && (
                          <span className="text-[10px] font-sans-clean px-1.5 py-0.2 rounded bg-[#F7DDE1] text-[#B98289] font-bold">
                            Author
                          </span>
                        )}
                        <span className="text-[11px] text-[#666747] font-sans-clean">
                          • {comment.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPinComment(story.id, comment.id)}
                          className="text-[11px] text-[#666747] hover:text-[#B98289] flex items-center gap-1 cursor-pointer"
                          title="Pin this reply"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-body text-[#44352F]/90 leading-relaxed mb-3">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => onLikeComment(story.id, comment.id)}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${
                          comment.userLiked ? 'text-[#B98289] font-medium' : 'text-[#666747] hover:text-[#B98289]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-[#B98289]' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                        className="text-[#666747] hover:text-[#44352F] flex items-center gap-1 cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-[#E9D9C9] space-y-3 pt-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="text-xs bg-[#FFF8F0]/60 p-3 rounded-lg border border-[#E9D9C9]/60">
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={reply.authorAvatar}
                                alt={reply.authorPseudonym}
                                className="w-5 h-5 rounded-full object-cover border border-[#D8A0A5]"
                              />
                              <span className="font-serif font-semibold text-[#44352F]">
                                {reply.authorPseudonym}
                              </span>
                              {reply.isStoryAuthor && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#F7DDE1] text-[#B98289]">
                                  Author
                                </span>
                              )}
                              <span className="text-[10px] text-[#666747]">• {reply.timestamp}</span>
                            </div>
                            <p className="font-body text-[#44352F]">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Composer */}
                    {replyingToId === comment.id && (
                      <form
                        onSubmit={(e) => handleReplySubmit(e, comment.id)}
                        className="mt-3 pl-4 border-l-2 border-[#D8A0A5] flex gap-2"
                      >
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply gently to ${comment.authorPseudonym}...`}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none focus:border-[#B98289]"
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#B7B99A] text-white text-xs font-serif hover:bg-[#666747] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Send
                        </button>
                      </form>
                    )}
                  </div>
                );
              })
              ) : (
                <div className="text-center py-8 bg-[#FFF8F0]/40 rounded-xl border border-dashed border-[#E9D9C9]">
                  <TeacupIcon className="w-6 h-6 text-[#B98289] mx-auto mb-2" />
                  <p className="font-note text-lg text-[#666747]">
                    No responses yet. Be the first gentle soul to leave a whisper.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Modal Dialog */}
        {reportModalOpen && (
          <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FFFCF8] rounded-xl border border-[#E9D9C9] p-6 max-w-sm w-full shadow-2xl text-xs space-y-4">
              <h4 className="font-editorial font-bold text-lg text-[#44352F]">
                Report This Letter
              </h4>
              <p className="text-[#666747]">
                We protect vulnerability and kind intentions. Let us know why this content concerns you:
              </p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 rounded-lg border border-[#E9D9C9] bg-white text-[#44352F] focus:outline-none"
              >
                <option>Harassment or hurtful behavior</option>
                <option>Self-harm or crisis concern</option>
                <option>Identifying personal information revealed</option>
                <option>Spam or inappropriate advertising</option>
              </select>

              {reportSubmitted ? (
                <div className="p-2.5 rounded-lg bg-[#F7DDE1] text-[#B98289] font-medium text-center">
                  Thank you. Our moderation circle has been alerted.
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReportModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#E9D9C9] hover:bg-gray-50 text-[#666747] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReport}
                    className="px-3 py-1.5 rounded-lg bg-[#B98289] text-white hover:bg-[#A36C73] cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
