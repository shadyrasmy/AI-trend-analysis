
import React from 'react';
import { Status } from '../types';
import { Icons } from './Icons';

interface StatusPanelProps {
  status: Status;
  message: string;
}

const statusConfig = {
  waiting: { icon: <Icons.Clock className="w-6 h-6 text-gray-400"/>, color: 'text-gray-300' },
  uploading: { icon: <Icons.UploadCloud className="w-6 h-6 text-blue-400"/>, color: 'text-blue-300' },
  analyzing: { icon: <Icons.Spinner className="w-6 h-6 animate-spin text-cyan-400"/>, color: 'text-cyan-300' },
  generating: { icon: <Icons.Spinner className="w-6 h-6 animate-spin text-purple-400"/>, color: 'text-purple-300' },
  ready: { icon: <Icons.CheckCircle className="w-6 h-6 text-green-400"/>, color: 'text-green-300' },
  error: { icon: <Icons.AlertTriangle className="w-6 h-6 text-red-400"/>, color: 'text-red-300' },
};

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, message }) => {
  const config = statusConfig[status];

  return (
    <div className="h-16 flex items-center justify-center p-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-[0_10px_40px_rgba(0,200,255,0.06)] backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          <p className="font-bold text-white">SAVIO Status</p>
          <p className={`text-sm ${config.color}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};
