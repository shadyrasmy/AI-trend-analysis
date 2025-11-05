import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnalysisResult, Status, AdvancedControlsState } from './types';
import { analyzeVideo, cloneVideo } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatusPanel } from './components/StatusPanel';
import { ResultCard, HashtagDisplay } from './components/ResultCard';
import { PromptCard } from './components/PromptCard';
import { HistorySidebar, HistoryItem } from './components/HistorySidebar';
import { Icons } from './components/Icons';
import { AdvancedControls } from './components/AdvancedControls';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [optionalContext, setOptionalContext] = useState('');
  const [status, setStatus] = useState<Status>('waiting');
  const [statusMessage, setStatusMessage] = useState('Waiting for upload');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<'analyze' | 'clone' | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [advancedControls, setAdvancedControls] = useState<AdvancedControlsState>({
    detailLevel: 'Professional',
    analysisType: 'Comprehensive',
    videoMood: 'Energetic',
    lightingStyles: [],
    cameraStyles: [],
    voiceDialect: 'Egyptian',
    voiceTone: 'Energetic',
    cloneSettings: {
      strictDuration: true,
      preserveStructure: true,
    },
    performanceMode: 'Fast',
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('حجم الفيديو كبير أو نوع الملف غير مدعوم. جرب mp4/mov وبحد أقصى 100MB.');
        return;
      }
      if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
        setError('حجم الفيديو كبير أو نوع الملف غير مدعوم. جرب mp4/mov وبحد أقصى 100MB.');
        return;
      }
      setError(null);
      setVideoFile(file);
      
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        setVideoDuration(videoElement.duration);
      }
      videoElement.src = URL.createObjectURL(file);

      setStatus('waiting');
      setStatusMessage(`${file.name} ready for action.`);
      setResults(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'], 'video/webm': ['.webm'] },
    maxFiles: 1,
    multiple: false
  });

  const addToHistory = (resultData: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      timestamp: new Date(),
      data: resultData,
    };
    setHistory(prev => [newItem, ...prev].slice(0, 3));
  };

  const handleSelectHistory = (data: AnalysisResult) => {
    setResults(data);
    setStatus('ready');
    setStatusMessage('Loaded from history.');
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setCurrentAction('analyze');
    setStatus('analyzing');
    setStatusMessage('Analyzing... SAVIO is extracting speech and frames.');
    setResults(null);
    setError(null);
    try {
      const analysisResults = await analyzeVideo(videoFile, optionalContext, advancedControls, videoDuration);
      setResults(analysisResults);
      addToHistory(analysisResults);
      setStatus('ready');
      setStatusMessage('Ready: 3 creative prompts generated.');
    } catch (e) {
      const err = e as Error;
      setStatus('error');
      setStatusMessage('Analysis failed. Try re-uploading or adjust controls.');
      setError(err.message);
      console.error(err);
    } finally {
      setCurrentAction(null);
    }
  };

  const handleClone = async () => {
    if (!videoFile) return;
    setCurrentAction('clone');
    setStatus('analyzing');
    setStatusMessage('Cloning... SAVIO is replicating the video structure.');
    setResults(null);
    setError(null);
    try {
      const cloneResults = await cloneVideo(videoFile, advancedControls, videoDuration);
      setResults(cloneResults);
      addToHistory(cloneResults);
      setStatus('ready');
      setStatusMessage('Ready: 1:1 clone prompts generated.');
    } catch (e) {
      const err = e as Error;
      setStatus('error');
      setStatusMessage('Cloning failed. The video might be too complex.');
      setError(err.message);
      console.error(err);
    } finally {
      setCurrentAction(null);
    }
  };

  const dropzoneStyle = useMemo(() => ({
    transition: 'all 0.3s ease-in-out',
    boxShadow: isDragActive ? '0 0 24px rgba(0,255,242,0.24)' : 'none',
    borderColor: isDragActive ? 'rgba(0,255,242,0.5)' : 'rgba(0,255,242,0.12)',
  }), [isDragActive]);

  const isProcessing = status === 'analyzing' || status === 'generating';

  return (
    <div className="min-h-screen text-[#E6F7FF] font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div
                {...getRootProps()}
                style={dropzoneStyle}
                className="h-64 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-2xl cursor-pointer bg-[rgba(255,255,255,0.04)]"
              >
                <input {...getInputProps()} />
                <Icons.Upload className="w-12 h-12 mb-4 text-[#00FFF2] opacity-50"/>
                <p className="text-lg font-semibold text-gray-300">🎬 اسحب الفيديو هنا أو اضغط للرفع</p>
                <p className="text-sm text-gray-500 mt-2">MP4, MOV, WEBM (Max 100MB)</p>
                {videoFile && <p className="text-sm text-[#00FFF2] mt-4">Selected: {videoFile.name}</p>}
              </div>
              
              {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

              <AdvancedControls controls={advancedControls} setControls={setAdvancedControls} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button
                    onClick={handleAnalyze}
                    disabled={!videoFile || isProcessing}
                    className="w-full py-3.5 px-4 text-base font-bold text-black rounded-xl bg-gradient-to-r from-[#00FFF2] to-[#A600FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-[0_10px_40px_rgba(0,200,255,0.1)]"
                  >
                    {isProcessing && currentAction === 'analyze' ? (
                      <div className="flex items-center justify-center">
                        <Icons.Spinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Icons.Rocket className="mr-2 h-5 w-5"/>
                        Analyze Trend
                      </div>
                    )}
                  </button>
                  <button
                    onClick={handleClone}
                    disabled={!videoFile || isProcessing}
                    className="w-full py-3.5 px-4 text-base font-bold text-white rounded-xl bg-gray-700/80 hover:bg-gray-600/80 border border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-[0_10px_40px_rgba(150,150,150,0.1)]"
                  >
                     {isProcessing && currentAction === 'clone' ? (
                      <div className="flex items-center justify-center">
                        <Icons.Spinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Cloning...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Icons.Copy className="mr-2 h-5 w-5"/>
                        Clone Video
                      </div>
                    )}
                  </button>
              </div>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <StatusPanel status={status} message={statusMessage} />

              <div className="space-y-6">
                {results && (
                  <>
                    <ResultCard title="🧠 AI Summary" icon={<Icons.Brain className="w-6 h-6"/>}>
                      <p className="text-gray-300">{results.trend_summary}</p>
                    </ResultCard>
                    <ResultCard title="🔑 Key Insights" icon={<Icons.Key className="w-6 h-6"/>}>
                      <ul className="list-disc pl-5 space-y-1 text-gray-300">
                        {results.success_factors.map((factor, i) => <li key={i}>{factor}</li>)}
                      </ul>
                    </ResultCard>
                     {results.top_keywords.length > 0 && results.genre !== 'Video Adaptation' && (
                        <ResultCard title="🏷️ Keywords" icon={<Icons.Tag className="w-6 h-6"/>}>
                          <div className="flex flex-wrap gap-2">
                            {results.top_keywords.map((kw, i) => (
                              <span key={i} className="bg-cyan-900/50 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">{kw}</span>
                            ))}
                          </div>
                        </ResultCard>
                     )}
                     {results.hashtags && results.hashtags.length > 0 && (
                        <ResultCard title="📈 Recommended Hashtags" icon={<Icons.Hashtag className="w-6 h-6"/>}>
                          <HashtagDisplay hashtags={results.hashtags} />
                        </ResultCard>
                      )}
                  </>
                )}
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
                     <Icons.Spinner className="w-12 h-12 animate-spin text-[#00FFF2]"/>
                     <p className="mt-4 text-gray-300">SAVIO is thinking...</p>
                     <p className="text-sm text-gray-500">This might take a moment, especially with High Quality mode.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column (History & Prompts) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <HistorySidebar history={history} onSelect={handleSelectHistory} />
              
              {results && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Icons.Puzzle className="w-6 h-6 text-[#A600FF]"/> Generated Prompts
                  </h3>
                  {results.prompts.map(prompt => (
                      <PromptCard 
                          key={prompt.id} 
                          prompt={prompt} 
                        />
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;