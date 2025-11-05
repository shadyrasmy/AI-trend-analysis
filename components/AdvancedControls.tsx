// Fix: Create the AdvancedControls component module
import React, { useState } from 'react';
import { AdvancedControlsState, DetailLevel, AnalysisType, VideoMood, LightingStyle, CameraStyle, VoiceDialect, VoiceTone, PerformanceMode } from '../types';

interface AdvancedControlsProps {
  controls: AdvancedControlsState;
  setControls: React.Dispatch<React.SetStateAction<AdvancedControlsState>>;
}

// Fix: Make `createOptions` generic to preserve literal types from the input array.
// It now accepts a readonly array to work with `as const` assertions.
const createOptions = <T extends string>(options: readonly T[]) => options.map(opt => ({ value: opt, label: opt }));

// Fix: Add `as const` to array literals to infer the narrowest possible type (string literal union)
// instead of `string[]`. This resolves the type mismatch errors.
const detailLevelOptions: { value: DetailLevel, label: string }[] = createOptions(['Normal', 'Professional', 'Cinematic'] as const);
const analysisTypeOptions: { value: AnalysisType, label: string }[] = createOptions(['Visual Only', 'Audio Only', 'Comprehensive'] as const);
const videoMoodOptions: { value: VideoMood, label: string }[] = createOptions(['Happy', 'Dramatic', 'Sad', 'Inspiring', 'Mysterious', 'Energetic'] as const);
const lightingStyleOptions: { value: LightingStyle, label: string }[] = createOptions(['Natural', 'Studio', 'Neon', 'Warm', 'Cold'] as const);
const cameraStyleOptions: { value: CameraStyle, label: string }[] = createOptions(['Handheld', 'Static', 'Drone', 'First-Person View'] as const);
const voiceDialectOptions: { value: VoiceDialect, label: string }[] = createOptions(['Egyptian', 'Moroccan', 'Lebanese', 'Algerian', 'Syrian', 'Gulf', 'English'] as const);
const voiceToneOptions: { value: VoiceTone, label: string }[] = createOptions(['Calm', 'Energetic', 'Dramatic'] as const);
const performanceModeOptions: { value: PerformanceMode, label: string }[] = createOptions(['Fast', 'High Quality'] as const);

export const AdvancedControls: React.FC<AdvancedControlsProps> = ({ controls, setControls }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleControlChange = <K extends keyof AdvancedControlsState>(key: K, value: AdvancedControlsState[K]) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const handleCloneSettingChange = <K extends keyof AdvancedControlsState['cloneSettings']>(key: K, value: AdvancedControlsState['cloneSettings'][K]) => {
    setControls(prev => ({
      ...prev,
      cloneSettings: {
        ...prev.cloneSettings,
        [key]: value
      }
    }));
  };

  const handleMultiSelectChange = (key: 'lightingStyles' | 'cameraStyles', value: string) => {
    const currentValues = controls[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    handleControlChange(key, newValues as any);
  };
  
  return (
    <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="font-bold text-white">Advanced Controls</h3>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)] space-y-4">
          {/* General Settings */}
          <ControlGroup title="General Settings">
            <SelectControl label="Detail Level" value={controls.detailLevel} options={detailLevelOptions} onChange={e => handleControlChange('detailLevel', e.target.value as DetailLevel)} />
            <SelectControl label="Analysis Type" value={controls.analysisType} options={analysisTypeOptions} onChange={e => handleControlChange('analysisType', e.target.value as AnalysisType)} />
            <SelectControl label="Performance Mode" value={controls.performanceMode} options={performanceModeOptions} onChange={e => handleControlChange('performanceMode', e.target.value as PerformanceMode)} />
          </ControlGroup>
          
          {/* Creative Direction */}
          <ControlGroup title="Creative Direction">
            <SelectControl label="Video Mood" value={controls.videoMood} options={videoMoodOptions} onChange={e => handleControlChange('videoMood', e.target.value as VideoMood)} />
            <MultiSelectControl label="Lighting Styles" options={lightingStyleOptions} selected={controls.lightingStyles} onChange={value => handleMultiSelectChange('lightingStyles', value)} />
            <MultiSelectControl label="Camera Styles" options={cameraStyleOptions} selected={controls.cameraStyles} onChange={value => handleMultiSelectChange('cameraStyles', value)} />
          </ControlGroup>

          {/* Voice & Clone Settings */}
          <ControlGroup title="Voice & Clone Settings">
            <SelectControl label="Voice-over Dialect" value={controls.voiceDialect} options={voiceDialectOptions} onChange={e => handleControlChange('voiceDialect', e.target.value as VoiceDialect)} />
            <SelectControl label="Voice-over Tone" value={controls.voiceTone} options={voiceToneOptions} onChange={e => handleControlChange('voiceTone', e.target.value as VoiceTone)} />
            <CheckboxControl label="Strict Duration (Clone)" checked={controls.cloneSettings.strictDuration} onChange={e => handleCloneSettingChange('strictDuration', e.target.checked)} />
            <CheckboxControl label="Preserve Structure (Clone)" checked={controls.cloneSettings.preserveStructure} onChange={e => handleCloneSettingChange('preserveStructure', e.target.checked)} />
          </ControlGroup>
        </div>
      )}
    </div>
  );
};

const ControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-gray-400 border-b border-gray-700 pb-1">{title}</h4>
    {children}
  </div>
);

const SelectControl: React.FC<{ label: string; value: string; options: {value: string, label: string}[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select value={value} onChange={onChange} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#00FFF2] focus:outline-none">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const CheckboxControl: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-[#00FFF2] focus:ring-[#00FFF2]/50" />
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

const MultiSelectControl: React.FC<{ label: string; options: {value: string, label: string}[]; selected: string[]; onChange: (value: string) => void }> = ({ label, options, selected, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${selected.includes(opt.value) ? 'bg-[#00FFF2] text-black border-[#00FFF2]' : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);
