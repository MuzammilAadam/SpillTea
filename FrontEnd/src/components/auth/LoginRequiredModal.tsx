import React from 'react';
import { X, Heart, Feather } from 'lucide-react';
import { TeacupIcon, WashiTapeStrip, PressedFlower } from '../common/Botanicals';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  actionMessage?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick,
  actionMessage = 'Sign in to share your story and connect with gentle hearts.',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-sm bg-[#FFFCF8] rounded-3xl border border-[#E9D9C9] p-7 sm:p-8 shadow-2xl overflow-hidden text-center"
        style={{
          backgroundImage: 'radial-gradient(#e5dfd3 0.75px, transparent 0.75px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Washi Tape Header */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none">
          <WashiTapeStrip color="#F7DDE1" width="w-28" rotation="-rotate-1" />
        </div>

        {/* Decorative corner pressed flower */}
        <div className="absolute top-4 right-12 pointer-events-none opacity-60">
          <PressedFlower className="w-7 h-7 text-[#D8A0A5]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#666747] hover:text-[#44352F] hover:bg-[#F4EBE1] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Botanical Teacup & Heart Icon */}
        <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-[#FFF8F0] border border-[#E9D9C9] mb-4 shadow-2xs mt-2 relative">
          <TeacupIcon className="w-7 h-7 text-[#B98289]" />
          <Heart className="w-3.5 h-3.5 text-[#D8A0A5] fill-[#D8A0A5] absolute -bottom-0.5 -right-0.5 animate-bounce-subtle" />
        </div>

        {/* Emotional Sanctuary Heading */}
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#44352F] tracking-tight">
          Your words are waiting for you.
        </h2>

        {/* Action message */}
        <p className="font-serif italic text-xs text-[#666747] mt-2 mb-6 leading-relaxed max-w-xs mx-auto">
          {actionMessage}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onLoginClick();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B98289] hover:bg-[#A66D74] text-white font-serif font-medium text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <TeacupIcon className="w-4 h-4" />
            <span>Log In</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onRegisterClick();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF8F0] border border-[#D8A0A5] text-[#44352F] font-serif font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Feather className="w-4 h-4 text-[#B98289]" />
            <span>Create an Account</span>
          </button>
        </div>

        {/* Reassurance Footer */}
        <p className="text-[11px] font-sans-clean text-[#666747]/80 mt-5">
          Always anonymous • Your drafts remain gently preserved
        </p>
      </div>
    </div>
  );
};
