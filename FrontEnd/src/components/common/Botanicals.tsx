import React from 'react';

export const TeacupIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5 text-[#B98289]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <path d="M6 2c0 1.5 1.5 2 1.5 3" />
    <path d="M10 2c0 1.5 1.5 2 1.5 3" />
    <path d="M14 2c0 1.5 1.5 2 1.5 3" />
  </svg>
);

export const PressedFlower: React.FC<{ className?: string }> = ({ className = 'w-8 h-8 text-[#D8A0A5]' }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} opacity="0.85">
    <path d="M50 20 C45 35 35 45 20 50 C35 55 45 65 50 80 C55 65 65 55 80 50 C65 45 55 35 50 20 Z" fill="#D8A0A5" />
    <circle cx="50" cy="50" r="8" fill="#B98289" />
    <path d="M50 58 Q55 78 60 95" stroke="#666747" strokeWidth="2" fill="none" />
    <path d="M53 70 Q62 65 66 68" stroke="#666747" strokeWidth="1.5" fill="none" />
  </svg>
);

export const OliveBranch: React.FC<{ className?: string }> = ({ className = 'w-12 h-6 text-[#666747]' }) => (
  <svg viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M10 30 Q60 10 110 20" stroke="#666747" />
    {/* Leaves */}
    <ellipse cx="30" cy="18" rx="8" ry="4" transform="rotate(-25 30 18)" fill="#B7B99A" stroke="#666747" />
    <ellipse cx="50" cy="14" rx="8" ry="4" transform="rotate(20 50 14)" fill="#B7B99A" stroke="#666747" />
    <ellipse cx="70" cy="16" rx="8" ry="4" transform="rotate(-15 70 16)" fill="#B7B99A" stroke="#666747" />
    <ellipse cx="90" cy="18" rx="8" ry="4" transform="rotate(30 90 18)" fill="#B7B99A" stroke="#666747" />
    <ellipse cx="106" cy="20" rx="7" ry="3.5" transform="rotate(5 106 20)" fill="#B7B99A" stroke="#666747" />
  </svg>
);

export const LavenderSprig: React.FC<{ className?: string }> = ({ className = 'w-6 h-12 text-[#B98289]' }) => (
  <svg viewBox="0 0 40 80" fill="currentColor" className={className} opacity="0.8">
    <path d="M20 78 L20 20" stroke="#666747" strokeWidth="1.5" fill="none" />
    <ellipse cx="20" cy="15" rx="3.5" ry="5" fill="#B98289" />
    <ellipse cx="16" cy="22" rx="3.5" ry="5" transform="rotate(-20 16 22)" fill="#D8A0A5" />
    <ellipse cx="24" cy="22" rx="3.5" ry="5" transform="rotate(20 24 22)" fill="#D8A0A5" />
    <ellipse cx="15" cy="30" rx="3.5" ry="5" transform="rotate(-25 15 30)" fill="#B98289" />
    <ellipse cx="25" cy="30" rx="3.5" ry="5" transform="rotate(25 25 30)" fill="#B98289" />
    <ellipse cx="16" cy="38" rx="3" ry="4.5" transform="rotate(-20 16 38)" fill="#D8A0A5" />
    <ellipse cx="24" cy="38" rx="3" ry="4.5" transform="rotate(20 24 38)" fill="#D8A0A5" />
  </svg>
);

export const PaperClip: React.FC<{ className?: string }> = ({ className = 'w-6 h-8 text-[#D8A0A5]' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88" />
  </svg>
);

export const WaxSeal: React.FC<{ className?: string; label?: string }> = ({ className = 'w-10 h-10', label = 'ST' }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-[#B98289] shadow-md border-2 border-[#D8A0A5] text-[#FFF8F0] font-editorial text-xs font-bold tracking-wider select-none ${className}`}>
    <div className="absolute inset-0 rounded-full border border-dashed border-[#F7DDE1]/40" />
    <span>{label}</span>
  </div>
);

export const WashiTapeStrip: React.FC<{
  color?: string;
  className?: string;
  rotation?: string;
  width?: string;
}> = ({ color = '#F7DDE1', className = '', rotation = '-rotate-1', width = 'w-24' }) => (
  <div
    className={`h-5 ${width} ${rotation} shadow-xs border-y border-dashed border-black/10 select-none pointer-events-none opacity-85 ${className}`}
    style={{ backgroundColor: color }}
  />
);
