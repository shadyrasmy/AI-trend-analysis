import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import { Icons } from './Icons';

interface PromptCardProps {
  prompt: Prompt;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const [soraPrompt, setSoraPrompt] = useState(prompt.sora_prompt);
  const [veoPrompt, setVeoPrompt] = useState(prompt.veo_prompt);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    setSoraPrompt(prompt.sora_prompt);
    setVeoPrompt(prompt.veo_prompt);
  }, [prompt]);

  const handleGenerate = (promptText: string, model: 'SORA 2' | 'VEO 3.1') => {
    if (!promptText || promptText.trim() === '') {
      alert(`⚠️ No prompt found for ${model}. Please analyze or generate first.`);
      return;
    }
    
    const generationUrl = model === 'SORA 2' 
      ? 'https://geminigen.ai/?mode=sora2' 
      : 'https://geminigen.ai/?mode=veo3.1';

    navigator.clipboard.writeText(promptText).then(() => {
      window.open(generationUrl, '_blank', 'noopener,noreferrer');
      setCopyMessage(`✅ ${model} prompt copied! Paste it into GeminiGen to generate your video.`);
      setTimeout(() => setCopyMessage(null), 4000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('❌ Failed to copy prompt. Please try again.');
    });
  };

  const handleCopy = (promptText: string, model: 'SORA 2' | 'VEO 3.1') => {
    if (!promptText || promptText.trim() === '') {
        alert(`⚠️ No prompt found for ${model}.`);
        return;
    }
    navigator.clipboard.writeText(promptText).then(() => {
        setCopyMessage(`✅ ${model} prompt copied!`);
        setTimeout(() => setCopyMessage(null), 3000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('❌ Failed to copy prompt. Please try again.');
    });
  };

  const modelConfig = {
    'SORA 2': { icon: <Icons.Layers className="h-4 w-4" />, color: 'text-purple-400' },
    'VEO 3.1': { icon: <Icons.Video className="h-4 w-4" />, color: 'text-cyan-400' },
  };

  return (
    <div className="bg-[rgba(255,255,255,0.04)] p-4 rounded-xl border border-transparent hover:border-[#00FFF2]/30 transition-all duration-300 shadow-lg relative overflow-hidden group">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_farthest-side,rgba(0,255,242,0.1),rgba(0,0,0,0))] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[spin_5s_linear_infinite]"></div>
        <div className="relative z-10">
            <h4 className="font-bold text-gray-200">{prompt.label}</h4>
            <p className="text-sm text-gray-400 mt-1 mb-4">{prompt.plain_prompt}</p>

            {/* SORA Prompt Text Area */}
            <div className="flex justify-between items-center">
              <h5 className={`flex items-center gap-2 font-semibold ${modelConfig['SORA 2'].color}`}>
                  {modelConfig['SORA 2'].icon} SORA 2 Prompt
              </h5>
              <button onClick={() => handleCopy(soraPrompt, 'SORA 2')} title="Copy SORA 2 Prompt" className="text-gray-400 hover:text-white transition p-1 rounded-md hover:bg-gray-700/50">
                  <Icons.Copy className="h-4 w-4" />
              </button>
            </div>
            <textarea
                value={soraPrompt}
                onChange={(e) => setSoraPrompt(e.target.value)}
                rows={6}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-2 mt-2 text-xs font-mono placeholder-gray-500 focus:ring-1 focus:ring-purple-400 focus:outline-none transition"
            />

            {/* VEO Prompt Text Area */}
            <div className="flex justify-between items-center mt-4">
              <h5 className={`flex items-center gap-2 font-semibold ${modelConfig['VEO 3.1'].color}`}>
                  {modelConfig['VEO 3.1'].icon} VEO 3.1 Prompt
              </h5>
              <button onClick={() => handleCopy(veoPrompt, 'VEO 3.1')} title="Copy VEO 3.1 Prompt" className="text-gray-400 hover:text-white transition p-1 rounded-md hover:bg-gray-700/50">
                  <Icons.Copy className="h-4 w-4" />
              </button>
            </div>
            <textarea
                value={veoPrompt}
                onChange={(e) => setVeoPrompt(e.target.value)}
                rows={6}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-2 mt-2 text-xs font-mono placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition"
            />
            
            {/* New Generate Buttons and Copy Message */}
            <div className="flex flex-col items-center gap-4 mt-6">
                <button 
                    onClick={() => handleGenerate(soraPrompt, 'SORA 2')}
                    className="w-full max-w-sm font-bold text-white text-base transition-all duration-200 ease-in-out transform shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                    style={{ 
                      background: 'linear-gradient(90deg, #6A11CB 0%, #2575FC 100%)',
                      borderRadius: '14px',
                      padding: '14px 24px',
                    }}
                >
                    🎬 Generate with SORA 2
                </button>
                <button 
                    onClick={() => handleGenerate(veoPrompt, 'VEO 3.1')}
                    className="w-full max-w-sm font-bold text-white text-base transition-all duration-200 ease-in-out transform shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                    style={{
                      background: 'linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)',
                      borderRadius: '14px',
                      padding: '14px 24px',
                    }}
                >
                    🎞️ Generate with VEO 3.1
                </button>
                {copyMessage && (
                    <p className="text-[#00FFAE] font-semibold mt-2.5 text-sm text-center">
                        {copyMessage}
                    </p>
                )}
            </div>
        </div>
    </div>
  );
};