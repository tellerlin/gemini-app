export const GEMINI_MODELS: Array<{
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  maxTokens: number;
  supportsAudio?: boolean;
  supportsVideo?: boolean;
  supportsPdf?: boolean;
  supportsLive?: boolean;
  supportsImageGeneration?: boolean;
  costTier?: 'free' | 'low' | 'medium' | 'high';
}> = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (GA)',
    description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more - now in General Availability with thinking capability',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    maxTokens: 2000000, // Updated context window for 2025
    costTier: 'high',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (GA)',
    description: 'Adaptive thinking with cost efficiency - General Availability version with thinking budgets',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 1000000, // Updated context window for 2025
    costTier: 'medium',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Most cost-efficient model supporting high throughput and faster processing',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 8192,
    costTier: 'low',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen features with superior speed, native tool use, and 1M token context window',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 1000000,
    costTier: 'medium',
  },
  {
    id: 'gemini-2.5-flash-live',
    name: 'Gemini 2.5 Flash Live',
    description: 'Low-latency bidirectional voice and video interactions with real-time processing',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsLive: true,
    maxTokens: 8192,
    costTier: 'high',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash (Image Generation)',
    description: 'Image generation and editing capabilities with text-to-image and image-to-image support',
    supportsVision: true,
    supportsAudio: false,
    supportsVideo: false,
    supportsImageGeneration: true,
    maxTokens: 1000000,
    costTier: 'medium',
  },
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';