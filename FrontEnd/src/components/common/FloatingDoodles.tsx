import React from 'react';

export const FloatingDoodles: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      {/* 1. Tiny hand-drawn heart top-left */}
      <svg
        className="absolute top-12 left-8 w-6 h-6 text-[#D8A0A5]/40 animate-float-slow"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      {/* 2. Four-point starry sparkle top-right */}
      <svg
        className="absolute top-20 right-14 w-5 h-5 text-[#B7B99A]/50 animate-sparkle"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
      </svg>

      {/* 3. Small pressed daisy petal middle-left */}
      <svg
        className="absolute top-1/3 left-6 w-7 h-7 text-[#D8A0A5]/35 animate-float-drift"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="16" cy="16" r="3" fill="#E9D9C9" />
        <path d="M16 6 C14 10, 18 10, 16 13" />
        <path d="M16 26 C14 22, 18 22, 16 19" />
        <path d="M6 16 C10 14, 10 18, 13 16" />
        <path d="M26 16 C22 14, 22 18, 19 16" />
        <path d="M8.9 8.9 C12 11, 14 13, 14 14" />
        <path d="M23.1 23.1 C20 21, 18 19, 18 18" />
        <path d="M23.1 8.9 C20 11, 18 13, 18 14" />
        <path d="M8.9 23.1 C12 21, 14 19, 14 18" />
      </svg>

      {/* 4. Little hand-drawn paper clip middle-right */}
      <svg
        className="absolute top-1/2 right-10 w-5 h-7 text-[#B98289]/30 animate-float-slow"
        style={{ animationDelay: '1.5s' }}
        viewBox="0 0 24 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M16 8v16a6 6 0 0 1-12 0V9a4 4 0 0 1 8 0v14a2 2 0 0 1-4 0V11" />
      </svg>

      {/* 5. Delicate mini teacup bottom-left */}
      <svg
        className="absolute bottom-16 left-16 w-6 h-6 text-[#666747]/30 animate-float-drift"
        style={{ animationDelay: '2.5s' }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M4 8h13a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
        <path d="M2 19h18" />
        <path d="M8 5c0-1.5 1-2 1-3" />
        <path d="M12 5c0-1.5 1-2 1-3" />
      </svg>

      {/* 6. Little twinkling star bottom-right */}
      <svg
        className="absolute bottom-24 right-20 w-4 h-4 text-[#B98289]/45 animate-sparkle"
        style={{ animationDelay: '1s' }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z" />
      </svg>

      {/* 7. Tiny washi snippet */}
      <div
        className="absolute top-3/4 left-1/3 w-10 h-3 bg-[#F7DDE1]/30 -rotate-6 rounded-xs border-l border-r border-dashed border-[#B98289]/20"
      />
    </div>
  );
};
