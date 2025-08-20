// Enhanced type safety utilities
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Brand types for better type safety
export type Brand<T, B> = T & { __brand: B };
export type MessageId = Brand<string, 'MessageId'>;
export type ConversationId = Brand<string, 'ConversationId'>;
export type FileId = Brand<string, 'FileId'>;
export type UserId = Brand<string, 'UserId'>;

// Timestamp utilities
export type ISO8601 = Brand<string, 'ISO8601'>;
export type UnixTimestamp = Brand<number, 'UnixTimestamp'>;

// API Response types
export type ApiResult<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

export type AsyncState<T> = 
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: T; error?: never }
  | { status: 'error'; data?: never; error: Error };

// Component props utilities
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;
export type ElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];

export interface Message {
  id: MessageId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokenUsage?: {
    input: number;
    output: number;
    thinking?: number;
  };
  responseTime?: number;
  modelUsed?: string;
  thinkingEnabled?: boolean;
  groundingMetadata?: GroundingMetadata;
  urlContextMetadata?: UrlContextMetadata;
}

export interface FileAttachment {
  id: FileId;
  name: string;
  type: string;
  size: number;
  url: string;
  data?: string; // base64 for images, videos, and PDFs
  mimeType?: string;
  lastModified?: Date;
  uploadProgress?: number;
}

export interface Conversation {
  id: ConversationId;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  config?: ConversationConfig;
  version?: number; // For optimistic updates
  status?: 'active' | 'archived' | 'deleted';
  tags?: string[];
  parentId?: ConversationId; // For conversation branching
}

export interface ConversationConfig {
  systemInstruction?: string;
  thinkingConfig?: ThinkingConfig;
  generationConfig?: GenerationConfig;
  groundingConfig?: GroundingConfig;
  urlContextConfig?: UrlContextConfig;
  // Interface settings
  streamingEnabled?: boolean;
  typewriterEffect?: boolean;
  smartLoadingIndicators?: boolean;
  realtimeFeedback?: boolean;
}

export interface GroundingConfig {
  enabled: boolean;
  useGoogleSearch: boolean;
  searchQueries?: string[];
  maxResults?: number;
}

export interface UrlContextConfig {
  enabled: boolean;
  urls?: string[];
  maxUrls?: number;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  groundingSupports?: Array<{
    segment?: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices?: number[];
  }>;
}

export interface UrlContextMetadata {
  urlMetadata?: Array<{
    retrievedUrl: string;
    urlRetrievalStatus: string;
  }>;
}

export interface ThinkingConfig {
  enabled: boolean;
  budget: number;
  showThinkingProcess?: boolean;
}

// Enhanced generation config with stricter types
export interface GenerationConfig {
  temperature: number; // 0.0 to 2.0
  topK: number; // 1 to 40
  topP: number; // 0.0 to 1.0
  maxOutputTokens: number; // 1 to 8192
  responseMimeType?: 'text/plain' | 'application/json' | 'text/x.enum';
  responseSchema?: Record<string, unknown>;
  presencePenalty?: number; // -2.0 to 2.0
  frequencyPenalty?: number; // -2.0 to 2.0
  stopSequences?: string[];
}

export interface ImageGenerationConfig {
  numberOfImages: number;
  sampleImageSize: '1K' | '2K';
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  personGeneration: 'dont_allow' | 'allow_adult' | 'allow_all';
  safetyFilterLevel?: 'block_most' | 'block_some' | 'block_few' | 'block_none';
  seed?: number;
  enhancePrompt?: boolean;
}


export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  supportsVision: boolean;
  supportsAudio?: boolean;
  supportsVideo?: boolean;
  supportsPdf?: boolean;
  supportsImageGeneration?: boolean;
  supportsLive?: boolean;
  supportsThinking?: boolean;
  maxTokens: number;
  costTier?: 'free' | 'low' | 'medium' | 'high';
  inputTokenCost?: number; // per 1K tokens
  outputTokenCost?: number; // per 1K tokens
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerMinute: number;
  };
  deprecated?: boolean;
  betaFeatures?: string[];
}

export interface PerformanceMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  successRate: string;
  uptime: number;
  currentKeyIndex: number;
  totalKeys: number;
  healthyKeys: number;
  timestamp: string;
  keyStats: KeyHealthStats[];
}

export interface KeyHealthStats {
  keyIndex: number;
  successCount: number;
  errorCount: number;
  successRate: string;
  lastUsed: ISO8601;
  lastError?: string;
  consecutiveErrors: number;
  isHealthy: boolean;
  cooldownUntil?: ISO8601;
  rateLimitReset?: ISO8601;
  errorHistory: ErrorRecord[];
}

export interface ErrorRecord {
  timestamp: ISO8601;
  error: string;
  code?: string;
  retryable: boolean;
}

// User management enhanced types
export interface UserProfile {
  id: UserId;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastUsed: Date;
  preferences?: UserPreferences;
  subscription?: SubscriptionInfo;
  usageStats?: UsageStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  defaultModel: string;
  autoSave: boolean;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    systemUpdates: boolean;
    securityAlerts: boolean;
    usageAlerts: boolean;
  };
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  reduceMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
}

export interface SubscriptionInfo {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
  totalUploadedFiles: number;
  averageResponseTime: number;
  mostUsedModel: string;
  dailyUsage: Record<string, number>;
  monthlyUsage: Record<string, number>;
}

// Error handling types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: UserId;
  conversationId?: ConversationId;
  messageId?: MessageId;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Validation schemas
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  successRate: string;
  uptime: number;
  currentKeyIndex: number;
  totalKeys: number;
  healthyKeys: number;
  timestamp: ISO8601;
  keyStats: KeyHealthStats[];
  systemMetrics?: SystemMetrics;
}

export interface SystemMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  activeConnections: number;
  responseTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}