import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center py-4 border-b border-b-[rgba(0,255,242,0.1)]">
    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SAVIO AI</span>
    </h1>
    <p className="mt-2 text-sm sm:text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#00FFF2] to-[#A600FF]">
      Trend Analyzer & Video Cloner (SORA 2 / VEO 3.1)
    </p>
  </header>
);