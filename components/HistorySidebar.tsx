import React from 'react';
import { AnalysisResult } from '../types';
import { Icons } from './Icons';

export interface HistoryItem {
  id: number;
  timestamp: Date;
  data: AnalysisResult;
}

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (data: AnalysisResult) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect }) => {
  return (
    <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,200,255,0.06)] backdrop-blur-xl h-full">
      <h3 className="text-xl font-bold flex items-center gap-3 text-white mb-4">
        <Icons.History className="w-6 h-6 text-[#00FFF2]" />
        Prompt History
      </h3>
      {history.length > 0 ? (
        <ul className="space-y-3">
          {history.map(item => (
            <li key={item.id}>
              <button 
                onClick={() => onSelect(item.data)}
                className="w-full text-left p-3 rounded-lg bg-gray-900/50 hover:bg-gray-800/70 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <p className="font-semibold text-gray-200 text-sm truncate">{item.data.genre}: {item.data.trend_summary}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.timestamp.toLocaleTimeString()} - {item.timestamp.toLocaleDateString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center text-center h-48 border-2 border-dashed border-gray-700 rounded-lg">
            <Icons.Clock className="w-8 h-8 text-gray-600 mb-2"/>
            <p className="text-gray-500 text-sm">No history yet.</p>
            <p className="text-gray-600 text-xs">Analyze a video to begin.</p>
        </div>
      )}
    </div>
  );
};
