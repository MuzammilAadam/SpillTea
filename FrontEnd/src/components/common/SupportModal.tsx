import React from 'react';
import { Heart, X, Phone, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { PressedFlower } from './Botanicals';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FFFCF8] rounded-2xl border border-[#E9D9C9] p-6 sm:p-8 shadow-2xl text-[#44352F]">
        {/* Decorative corner flower */}
        <div className="absolute top-3 left-4">
          <PressedFlower className="w-6 h-6 text-[#D8A0A5]" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-[#B98289] hover:bg-[#F7DDE1]/50 transition-colors"
          aria-label="Close support modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mt-2 mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#F7DDE1]/40 text-[#B98289] mb-3">
            <Heart className="w-6 h-6 fill-[#D8A0A5]" />
          </div>
          <h2 className="text-2xl font-editorial font-bold text-[#44352F]">You are not alone</h2>
          <p className="text-sm font-body text-[#666747] mt-1 max-w-sm mx-auto">
            SpillTea is a peer sanctuary for gentle personal reflections, but we are not licensed mental health providers or crisis responders.
          </p>
        </div>

        <div className="space-y-4 text-sm font-sans-clean">
          <div className="p-4 rounded-xl bg-[#FFF8F0] border border-[#E9D9C9]">
            <div className="flex items-center gap-2 font-semibold text-[#44352F] mb-1">
              <Phone className="w-4 h-4 text-[#B98289]" />
              <span>Immediate 24/7 Crisis Support</span>
            </div>
            <p className="text-xs text-[#666747] mb-3">
              If you or someone you care about is facing an overwhelming crisis or thoughts of self-harm, compassionate professionals are ready to listen free of charge:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between p-2 rounded bg-white border border-[#E9D9C9]/60">
                <span><strong>United States & Canada:</strong> Call or text <strong>988</strong></span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#F7DDE1] text-[#B98289] font-medium">Free & Confidential</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded bg-white border border-[#E9D9C9]/60">
                <span><strong>United Kingdom:</strong> Call <strong>111</strong> or text SHOUT to <strong>85258</strong></span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#F7DDE1] text-[#B98289] font-medium">24/7 Service</span>
              </li>
              <li className="flex items-center justify-between p-2 rounded bg-white border border-[#E9D9C9]/60">
                <span><strong>International Find-A-Helpline:</strong> Directory</span>
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#B98289] hover:underline flex items-center gap-1"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#B7B99A]/15 border border-[#B7B99A]/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#666747] mb-1">
              <Sparkles className="w-4 h-4 text-[#666747]" />
              <span>A Gentle Grounding Note</span>
            </div>
            <p className="text-xs text-[#44352F] leading-relaxed">
              Take one slow breath in through your nose for 4 counts, hold gently for 4 counts, and release slowly for 6 counts. You do not have to carry the whole mountain all at once today.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#B7B99A] text-white font-medium hover:bg-[#666747] transition-colors text-sm shadow-xs"
          >
            I understand, return to SpillTea
          </button>
        </div>
      </div>
    </div>
  );
};
