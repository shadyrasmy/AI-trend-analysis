
import React, { ReactNode, useState } from 'react';
import { Hashtag, TrendLevel } from '../types';
import { Icons } from './Icons';

interface ResultCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => (
  <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,200,255,0.06)] backdrop-blur-xl">
    <h3 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
      <span className="text-[#00FFF2]">{icon}</span>
      {title}
    </h3>
    <div className="prose prose-invert prose-sm max-w-none">
      {children}
    </div>
  </div>
);


const trendColorMap: Record<TrendLevel, string> = {
  'Very High': 'bg-red-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-green-500',
  'Low': 'bg-gray-500',
};

interface HashtagDisplayProps {
  hashtags: Hashtag[];
}

export const HashtagDisplay: React.FC<HashtagDisplayProps> = ({ hashtags }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const textToCopy = hashtags.map(h => `#${h.tag.replace(/\s/g, '')}`).join(' ');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div title="Auto-generated for maximum reach">
      <div className="flex justify-end -mt-12 mb-3">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 text-xs bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 font-semibold py-1.5 px-3 rounded-lg transition-colors"
          >
            {copied ? <Icons.Check className="w-4 h-4 text-green-400"/> : <Icons.Copy className="w-4 h-4"/>}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, i) => (
          <div key={i} className="flex items-center gap-2 bg-cyan-900/50 text-cyan-300 text-sm font-medium px-3 py-1.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${trendColorMap[hashtag.trend_level]}`}></span>
            <span>#{hashtag.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}