export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  data?: string; // base64 for images, videos, and PDFs
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  supportsAudio?: boolean;
  supportsVideo?: boolean;
  supportsPdf?: boolean;
  maxTokens: number;
}