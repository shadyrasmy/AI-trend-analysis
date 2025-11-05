export type TrendLevel = 'Very High' | 'High' | 'Medium' | 'Low';

export interface Hashtag {
  tag: string;
  trend_level: TrendLevel;
}

export interface Prompt {
  id: string;
  label: string;
  plain_prompt: string;
  sora_prompt: string;
  veo_prompt: string;
}

export interface AnalysisResult {
  trend_summary: string;
  genre: string;
  estimated_duration_seconds: number;
  scene_count: number;
  audience_demographics: string;
  success_factors: string[];
  top_keywords: string[];
  hook_suggestion: string;
  prompts: Prompt[];
  hashtags: Hashtag[];
}

export type Status = 'waiting' | 'uploading' | 'analyzing' | 'generating' | 'ready' | 'error';

export type ModelType = 'SORA 2' | 'VEO 3.1';

// --- Advanced Controls Types ---
export type DetailLevel = 'Normal' | 'Professional' | 'Cinematic';
export type AnalysisType = 'Visual Only' | 'Audio Only' | 'Comprehensive';
export type VideoMood = 'Happy' | 'Dramatic' | 'Sad' | 'Inspiring' | 'Mysterious' | 'Energetic';
export type LightingStyle = 'Natural' | 'Studio' | 'Neon' | 'Warm' | 'Cold';
export type CameraStyle = 'Handheld' | 'Static' | 'Drone' | 'First-Person View';
export type VoiceDialect = 'Egyptian' | 'Moroccan' | 'Lebanese' | 'Algerian' | 'Syrian' | 'Gulf' | 'English';
export type VoiceTone = 'Calm' | 'Energetic' | 'Dramatic';
export type PerformanceMode = 'Fast' | 'High Quality';

export interface AdvancedControlsState {
  detailLevel: DetailLevel;
  analysisType: AnalysisType;
  videoMood: VideoMood;
  lightingStyles: LightingStyle[];
  cameraStyles: CameraStyle[];
  voiceDialect: VoiceDialect;
  voiceTone: VoiceTone;
  cloneSettings: {
    strictDuration: boolean;
    preserveStructure: boolean;
  };
  performanceMode: PerformanceMode;
}