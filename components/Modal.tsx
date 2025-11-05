import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const promptText = (children as any)?.props?.children?.props?.children;
    if (typeof promptText === 'string') {
      navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0A1020] border border-[#00FFF2]/20 rounded-2xl shadow-2xl shadow-[#00FFF2]/10 w-full max-w-2xl p-6 relative transform transition-all" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition">
          <Icons.X className="w-6 h-6" />
        </button>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00FFF2]/20 to-[#A600FF]/20 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            {copied ? <Icons.Check className="w-5 h-5 text-green-400"/> : <Icons.Copy className="w-5 h-5"/>}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};