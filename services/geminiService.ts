import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AdvancedControlsState } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

const buildControlsContext = (controls: AdvancedControlsState, forClone: boolean, duration?: number): string => {
  let context = "Apply the following user-defined advanced controls:\n";
  context += `- Detail Level: ${controls.detailLevel}\n`;
  context += `- Analysis Type: ${controls.analysisType}\n`;
  context += `- Desired Mood: ${controls.videoMood}\n`;
  if (controls.lightingStyles.length > 0) context += `- Lighting & Cinematography: ${controls.lightingStyles.join(', ')}\n`;
  if (controls.cameraStyles.length > 0) context += `- Camera Styles: ${controls.cameraStyles.join(', ')}\n`;
  
  const dialectText = controls.voiceDialect === 'English' ? 'English' : `${controls.voiceDialect} Arabic`;
  context += `- Voice-over Settings: Use a ${controls.voiceTone} tone in the ${dialectText} dialect.\n`;
  
  if (forClone && duration) {
    context += `- Clone Mode Settings:\n`;
    context += `  - The original video is ${duration.toFixed(2)} seconds long.`;
    if(controls.cloneSettings.preserveStructure) {
      context += ` Faithfully preserve the original scene order, pacing, and camera work when adapting the content.\n`
    } else {
      context += ` Creatively adapt the content based on the original structure.\n`
    }
  }

  return context;
};

const hashtagSchema = {
    type: Type.OBJECT,
    properties: {
        tag: { type: Type.STRING, description: "The hashtag text, without the '#' symbol." },
        trend_level: { type: Type.STRING, description: "A simulated trend level. Must be one of: 'Very High', 'High', 'Medium', 'Low'." }
    },
    required: ["tag", "trend_level"]
};

const analysisOutputSchema = {
  type: Type.OBJECT,
  properties: {
    trend_summary: { type: Type.STRING, description: "Concise one-paragraph summary of the video's core idea and why it works." },
    genre: { type: Type.STRING },
    estimated_duration_seconds: { type: Type.NUMBER, description: "The exact duration of the original video, repeated here." },
    scene_count: { type: Type.NUMBER, description: "The total number of distinct scenes identified in the video." },
    audience_demographics: { type: Type.STRING, description: "Probable audience slice (e.g., 'youth 16-24, tech-savvy, global')." },
    success_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
    top_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    hook_suggestion: { type: Type.STRING },
    prompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          plain_prompt: { type: Type.STRING },
          sora_prompt: { type: Type.STRING, description: "The final SORA prompt. It must end with the required verification line." },
          veo_prompt: { type: Type.STRING, description: "The final VEO prompt. It must end with the required verification line." }
        },
        required: ["id", "label", "plain_prompt", "sora_prompt", "veo_prompt"]
      }
    },
    hashtags: {
      type: Type.ARRAY,
      description: "A list of 4-6 relevant hashtags with their simulated trend levels.",
      items: hashtagSchema
    }
  },
  required: ["trend_summary", "prompts", "hashtags", "scene_count"]
};

export const analyzeVideo = async (videoFile: File, optionalContext: string, controls: AdvancedControlsState, duration: number): Promise<AnalysisResult> => {
  const videoPart = await fileToGenerativePart(videoFile);
  const soraDuration = duration.toFixed(2);
  const voiceOverLanguage = controls.voiceDialect;
  const voiceOverScriptInstruction = voiceOverLanguage === 'English'
    ? `Write an expressive English voice-over script.`
    : `Write an expressive ${voiceOverLanguage} Arabic voice-over script. The script must be purely in the ${voiceOverLanguage} dialect. Do not add any English translations or text in parentheses.`;

  const voiceOverSection = `🗣️ **Voice-over (${voiceOverLanguage}):**
    - ${voiceOverScriptInstruction}
    - The script must be perfectly synchronized to each scene’s time window and the prompt's total duration.
    - For each line of dialogue, prefix it with the corresponding scene's time range (e.g., "- **0.00-2.15s:** Dialogue line.").`;

  const system_prompt = `You are SAVIO AI, a specialist video trend analyst. Your primary function is to analyze a provided video and generate creative prompts for SORA 2 and VEO 3.1. Adherence to the following duration rules is your most critical, non-negotiable instruction.

**Duration Enforcement Logic — SORA 2 & VEO 3.1**

🔹 **For SORA 2 (Exact Duration Match):**
- The prompt **must** always match the **exact duration** of the uploaded video, which is **${soraDuration} seconds**.
- Example: If the video is 9.40s, the prompt header must be "🎬 SORA 2 Prompt (9.40 seconds)".
- There is **no rounding**. Do not extend or shorten the duration.
- The scene-by-scene breakdown must precisely match the pacing and emotion of the original content. All scene timestamps must sum up to exactly ${soraDuration}s.

🔹 **For VEO 3.1 (Fixed 8-Second Adaptation):**
- The total prompt duration **must be exactly 8.00 seconds — always.**
- Regardless of the original video’s length, you must **intelligently condense or redistribute scenes** to fit perfectly into the 8.00-second timeline.
- The final scene breakdown must remain coherent, cinematic, and have a natural flow. Avoid fast cuts or unnatural compression.
- Recalculate all timestamps precisely so the final prompt header reads: "🎬 VEO 3.1 Prompt (8.00 seconds)".

**General Prompt Generation Rules:**

1.  **Analysis:** Internally analyze the video's speech, visuals, scenes, pacing, audio, and emotion to inform your prompt creation.
2.  **Prompt Content:** Generate 3 creative prompts (Closest Match, Enhanced, Trend-Shift). For each, provide a plain text version and the structured SORA 2 / VEO 3.1 versions.
3.  **Mandatory Structure:** Both structured prompts MUST use this exact markdown format:

    🎬 **[MODEL NAME] Prompt ([Correct Duration] seconds)**
    A cinematic, vivid, and emotionally expressive description of the entire video in one cohesive paragraph.

    🧩 **Scene-by-Scene Breakdown:**
    - Divide the video into an appropriate number of scenes.
    - For each scene, include a precise duration range (e.g., 0.00–2.15s) and a cinematic description.
    - The sum of scene durations MUST equal the prompt's total required duration for that model.

    ${voiceOverSection}

4.  **Verification & Correction (Mandatory):**
    - You **must** validate your own output before finalizing. Correct any duration mismatch.
    - At the end of EACH prompt, append the correct verification line on a new line:
      - For SORA 2: 'Original video duration detected: ${soraDuration} seconds — Scene count: [scene_count] — Final prompt duration matched: ${soraDuration} seconds.'
      - For VEO 3.1: 'Original video duration detected: ${soraDuration} seconds — Scene count: [scene_count] — Final prompt duration matched: 8.00 seconds.'

Finally, generate 4-6 relevant hashtags and respond with the complete JSON.`;
  
  const controlsContext = buildControlsContext(controls, false);
  const user_prompt = `Analyze the uploaded video. The original video's duration is precisely ${soraDuration} seconds. Adhere strictly to the Timing Enforcement Rule: SORA 2 prompts must be exactly ${soraDuration}s, and VEO 3.1 prompts must be exactly 8.00s. Use the 'optional_context' if provided: '${optionalContext}'.\n\n${controlsContext}\n\nPerformance Mode is '${controls.performanceMode}'. Output the results in the required JSON format.`;

  const model = controls.performanceMode === 'High Quality' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [videoPart, { text: user_prompt }]
    },
    config: {
      systemInstruction: system_prompt,
      responseMimeType: "application/json",
      responseSchema: analysisOutputSchema,
    }
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Analysis failed: Could not parse the AI's response.");
  }
};

const cloneOutputSchema = {
  type: Type.OBJECT,
  properties: {
    sora_prompt_clone: { type: Type.STRING, description: "The complete, final, markdown-formatted SORA 2 prompt. It must end with the required verification line." },
    veo_prompt_clone: { type: Type.STRING, description: "The complete, final, markdown-formatted VEO 3.1 prompt. It must end with the required verification line." },
    scene_count: { type: Type.NUMBER, description: "The total number of distinct scenes identified in the original video." },
    hashtags: {
      type: Type.ARRAY,
      description: "A list of 4-6 relevant hashtags with their simulated trend levels based on the video content.",
      items: hashtagSchema
    }
  },
  required: ["sora_prompt_clone", "veo_prompt_clone", "hashtags", "scene_count"]
}

export const cloneVideo = async (videoFile: File, controls: AdvancedControlsState, duration: number): Promise<AnalysisResult> => {
  const videoPart = await fileToGenerativePart(videoFile);
  const preciseDuration = duration.toFixed(2);
  const systemInstruction = `You are an expert video analyst and prompt engineer. Your task is to generate one perfect clone prompt for SORA 2 and one optimized adaptation for VEO 3.1 from a source video. You must strictly follow all user-defined controls and duration rules. Your output must be a JSON object adhering to the provided schema.`;
  
  const controlsContext = buildControlsContext(controls, true, duration);
  
  const voiceOverLanguage = controls.voiceDialect;
  const voiceOverScriptInstruction = voiceOverLanguage === 'English'
    ? `Write a voice-over script in English.`
    : `Write a voice-over script in the ${voiceOverLanguage} Arabic dialect. The script must be purely in the ${voiceOverLanguage} dialect, with no English translations in parentheses.`;

  const voiceOverSection = `🗣️ **Voice-over (${voiceOverLanguage}):**
    - ${voiceOverScriptInstruction}
    - The script must be perfectly synchronized to the prompt's specific duration (${preciseDuration}s for SORA 2, 8.00s for VEO 3.1).
    - For each line of dialogue, prefix it with the corresponding scene's time range (e.g., "- **0.00-2.15s:** Dialogue line.").`;

  const userPrompt = `
Analyze the provided video, which is precisely ${preciseDuration} seconds long. Your task is to generate one perfect clone prompt for SORA 2 and one optimized adaptation for VEO 3.1, strictly following the rules below.

**User's Advanced Controls to Apply:**
${controlsContext}

**Duration Enforcement Logic — SORA 2 & VEO 3.1**

🔹 **For SORA 2 (Perfect Clone):**
- The SORA 2 prompt you generate **must be a perfect clone**.
- Its total duration **must exactly match the original video's duration (${preciseDuration}s)**. No rounding allowed.
- Faithfully recreate the scene-by-scene breakdown, matching the pacing, emotion, and camera work of the original content.
- All scene timestamps must sum up to exactly ${preciseDuration}s.

🔹 **For VEO 3.1 (Optimized 8-Second Adaptation):**
- The total prompt duration **must be exactly 8.00 seconds — always.**
- Intelligently condense or redistribute scenes from the original video to fit perfectly into the 8.00-second timeline.
- The final breakdown must remain coherent, cinematic, and have a natural flow. Avoid fast cuts or unnatural compression.
- Recalculate all timestamps precisely. The header must read "🎬 VEO 3.1 Prompt (8.00 seconds)".

**General Prompt Requirements:**

1.  **Structure:** Both prompts MUST follow this exact markdown structure:

    🎬 **[MODEL NAME] Prompt ([Correct Duration] seconds)**
    A cinematic, vivid description of the entire video.

    🧩 **Scene-by-Scene Breakdown:**
    - Divide the video into scenes with clear timecodes.
    - Include a cinematic description for each scene.
    - The sum of scene durations must equal the prompt's required duration.

    ${voiceOverSection}

2.  **Verification & Correction (Mandatory):**
    - You **must** validate your own output before finalizing. Correct any duration mismatch.
    - At the end of EACH prompt, append the correct verification line on a new line:
      - For SORA 2: 'Original video duration detected: ${preciseDuration} seconds — Scene count: [scene_count] — Final prompt duration matched: ${preciseDuration} seconds.'
      - For VEO 3.1: 'Original video duration detected: ${preciseDuration} seconds — Scene count: [scene_count] — Final prompt duration matched: 8.00 seconds.'

Now, analyze the video, apply all rules, and return the final JSON.
`;
  const model = controls.performanceMode === 'High Quality' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [videoPart, { text: userPrompt }] },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: cloneOutputSchema
    }
  });

  try {
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);

    return {
      trend_summary: `Generated one SORA 2 clone prompt (${preciseDuration}s) and one VEO 3.1 adapted prompt (8.00s) from the source video.`,
      genre: "Video Clone & Adaptation",
      estimated_duration_seconds: duration,
      scene_count: parsed.scene_count || 0,
      audience_demographics: "N/A",
      success_factors: ["Exact duration matching (SORA)", "8s adaptation (VEO)", "Cinematic rhythm replication"],
      top_keywords: ["video clone", `SORA ${preciseDuration}s`, "VEO 8.00s"],
      hook_suggestion: "Adapted from original video.",
      prompts: [{
        id: 'clone-1',
        label: 'Adapted Video Prompts (SORA & VEO)',
        plain_prompt: `SORA 2 prompt is a clone (${preciseDuration}s), VEO 3.1 prompt is an adaptation (8.00s).`,
        sora_prompt: parsed.sora_prompt_clone,
        veo_prompt: parsed.veo_prompt_clone
      }],
      hashtags: parsed.hashtags || []
    };

  } catch (error) {
    console.error("Failed to parse Gemini response for clone:", response.text);
    throw new Error("Adaptation failed: Could not parse the AI's response.");
  }
}


export const generateAdaptedPrompt = async (plainPrompt: string, type: 'sora' | 'veo'): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const systemInstruction = "You are a professional video prompt engineer. Your task is to take a core video idea and expand it into a complete, structured video prompt for either SORA 2 or VEO 3.1. You must strictly adhere to the requested duration and the detailed markdown format provided in the user prompt, which includes a cinematic summary, a scene-by-scene breakdown, and an Egyptian Arabic voice-over. Your output must be a single block of text containing only the formatted prompt.";

  let userPrompt = '';
  if (type === 'sora') {
    userPrompt = `
Based on the following core video idea: "${plainPrompt}"

Generate a complete and professional 15-second video prompt formatted for the SORA 2 model, using the following structure precisely.

🎬 **SORA 2 Prompt (15.00 seconds)**
A cinematic, vivid, and emotionally expressive description of the entire video in one cohesive paragraph. Capture the mood, movement, and details naturally, ensuring it sounds like a real SORA 2-style video prompt.

🧩 **Scene-by-Scene Breakdown:**
Divide the video into 3–6 short scenes totaling exactly 15.00 seconds. Each scene must include:
- Duration range in seconds (e.g., 0.00–2.15s).
- Camera style or angle (e.g., static medium shot, handheld close-up, drone wide shot).
- A cinematic and concise description of actions, emotions, environment, and lighting.

🗣️ **Voice-over (Egyptian Arabic):**
Write a natural, expressive Egyptian Arabic voice-over script that matches the tone of the video. The script must be timed to fit the exact 15.00-second duration. Use natural spoken Egyptian expressions and timing cues that sound authentic. For example, the tone could be playful, emotional, or cinematic (e.g., "بام!... برافو!... أيوه!... هايل!... (ثم ضحك خفيف في النهاية).").
`;
  } else { // veo
    userPrompt = `
Based on the following core video idea: "${plainPrompt}"

Generate a complete and professional 8-second video prompt formatted for the VEO 3.1 model, using the following structure precisely.

🎬 **VEO 3.1 Prompt (8.00 seconds)**
A dynamic, vivid, and emotionally expressive description of the entire video in one cohesive paragraph. Capture the mood, movement, and details naturally, ensuring it sounds like a real VEO 3.1-style video prompt.

🧩 **Scene-by-Scene Breakdown:**
Divide the video into 2–4 short scenes totaling exactly 8.00 seconds. Each scene must include:
- Duration range in seconds (e.g., 0.00–2.15s).
- Camera style or angle (e.g., static medium shot, handheld close-up, drone wide shot).
- A cinematic and concise description of actions, emotions, environment, and lighting.

🗣️ **Voice-over (Egyptian Arabic):**
Write a natural, expressive Egyptian Arabic voice-over script that matches the tone of the video. The script must be timed to fit the exact 8.00-second duration. Use natural spoken Egyptian expressions and timing cues that sound authentic. For example, the tone could be playful, emotional, or cinematic (e.g., "بام!... برافو!... أيوه!... هايل!... (ثم ضحك خفيف في النهاية).").
`;
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: userPrompt,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  return response.text;
};