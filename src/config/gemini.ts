export const GEMINI_MODELS: Array<{
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  maxTokens: number;
  supportsAudio?: boolean;
  supportsVideo?: boolean;
  supportsPdf?: boolean;
}> = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsPdf: true,
    maxTokens: 8192,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Adaptive thinking, cost efficiency',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 8192,
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Most cost-efficient model supporting high throughput',
    supportsVision: true,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 8192,
  },
  {
    id: 'gemini-live-2.5-flash-preview',
    name: 'Gemini 2.5 Flash Live',
    description: 'Low-latency bidirectional voice and video interactions',
    supportsVision: false,
    supportsAudio: true,
    supportsVideo: true,
    maxTokens: 8192,
  },
];

export const DEFAULT_MODEL = 'gemini-2.5-flash';