// Proxy-enabled Gemini Service that works around CORS limitations
import type { Message, GroundingMetadata, UrlContextMetadata } from '../types/chat';
import { loadEnvConfig } from '../utils/env';
import { getNextBestModel, getModelSwitchExplanation } from '../config/gemini';

// Interface for proxy-compatible API requests
interface ProxyApiRequest {
  method: 'POST';
  url: string;
  headers: Record<string, string>;
  body: any;
}

interface ProxyApiResponse {
  text: string;
  candidates?: Array<{
    groundingMetadata?: GroundingMetadata;
    urlContextMetadata?: UrlContextMetadata;
  }>;
}

/**
 * Proxy-enabled Gemini Service that bypasses CORS by using a local proxy server
 * This service replaces direct Google API calls with calls to a local proxy
 */
export class ProxyGeminiService {
  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly MAX_RETRIES = 3;
  
  // Proxy configuration
  private proxyBaseUrl: string = '';
  private useProxy: boolean = false;
  
  // Statistics tracking
  private keyHealth: Map<number, {
    successCount: number;
    errorCount: number;
    lastUsed: Date;
    lastError?: string;
    consecutiveErrors: number;
  }> = new Map();
  
  private totalRequests = 0;
  private totalErrors = 0;
  private startTime = Date.now();
  
  // Model switching tracking
  private modelSwitchHistory: Array<{
    fromModel: string;
    toModel: string;
    reason: string;
    timestamp: Date;
  }> = [];
  
  private onModelSwitchCallback?: (fromModel: string, toModel: string, reason: string) => void;
  private currentAbortController?: AbortController;

  constructor(apiKeys?: string[], proxyUrl?: string) {
    if (apiKeys && apiKeys.length > 0) {
      this.setApiKeys(apiKeys);
    }
    
    // Set up proxy configuration
    this.setupProxy(proxyUrl);
  }

  /**
   * Setup proxy configuration for CORS bypass
   */
  private setupProxy(proxyUrl?: string): void {
    // Check if we're in development and should use proxy
    const isDevelopment = import.meta.env.DEV;
    
    // Always use local proxy server for API requests
    if (isDevelopment) {
      // In development, use local proxy server on port 3001
      this.proxyBaseUrl = 'http://localhost:3001/api/gemini';
      this.useProxy = true;
      console.log(`🌐 Using local development proxy: ${this.proxyBaseUrl}`);
    } else {
      // In production, use the same origin proxy
      this.proxyBaseUrl = '/api/gemini';
      this.useProxy = true;
      console.log(`🌐 Using production proxy: ${this.proxyBaseUrl}`);
    }
    
    // The external proxy (192.168.1.3:7890) is configured on the server side
    if (proxyUrl) {
      console.log(`📡 Server will use external proxy: ${proxyUrl} (configured server-side)`);
    }
  }

  /**
   * Set multiple API keys for round-robin functionality
   */
  setApiKeys(apiKeys: string[]): void {
    try {
      this.apiKeys = apiKeys.filter(key => key.trim() !== '');
      this.currentKeyIndex = 0;
      
      // Initialize health tracking for each key
      this.keyHealth.clear();
      this.apiKeys.forEach((_, index) => {
        this.keyHealth.set(index, {
          successCount: 0,
          errorCount: 0,
          lastUsed: new Date(0),
          consecutiveErrors: 0
        });
      });
      
      console.log(`✅ Proxy Gemini client initialized with ${this.apiKeys.length} API keys`);
    } catch (error) {
      console.error('❌ Failed to initialize Proxy Gemini client:', error);
      throw new Error(`Failed to initialize Proxy Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate streaming response with intelligent model switching using proxy
   */
  async* generateStreamingResponseWithModelSwitch(
    messages: Message[],
    preferredModel: string = 'gemini-2.0-flash',
    config?: any
  ): AsyncGenerator<{ 
    text?: string; 
    groundingMetadata?: GroundingMetadata; 
    urlContextMetadata?: UrlContextMetadata;
    modelSwitched?: boolean;
    newModel?: string;
    switchReason?: string;
  }, void, unknown> {
    
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available. Please set API keys first.');
    }

    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for generation');
    }

    console.log(`🚀 Starting proxy streaming with preferred model: ${preferredModel}`);
    console.log(`📝 Processing ${messages.length} messages`);

    let currentModel = preferredModel;
    let hasTriedAlternatives = false;

    while (true) {
      try {
        console.log(`🔄 Attempting proxy streaming with model: ${currentModel}`);
        
        yield* this.executeProxyStreamingWithModel(messages, currentModel, config);
        
        console.log(`✅ Proxy streaming successful with model: ${currentModel}`);
        return;
        
      } catch (error) {
        const errorAnalysis = this.categorizeApiError(error as Error);
        
        console.error(`❌ Model ${currentModel} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: errorAnalysis.category,
          allowModelSwitch: errorAnalysis.allowModelSwitch
        });

        if (errorAnalysis.allowModelSwitch && errorAnalysis.isQuotaExhausted && !hasTriedAlternatives) {
          const nextModel = getNextBestModel(currentModel);
          
          if (nextModel) {
            const switchReason = getModelSwitchExplanation(currentModel, nextModel);
            this.recordModelSwitch(currentModel, nextModel, `Quota exhausted: ${switchReason}`);
            
            yield {
              modelSwitched: true,
              newModel: nextModel,
              switchReason: `⚠️ ${currentModel} quota exhausted. ${switchReason}`
            };
            
            currentModel = nextModel;
            hasTriedAlternatives = true;
            continue;
          } else {
            throw new Error(`Quota exhausted for model ${currentModel} and no suitable alternatives available.`);
          }
        }
        
        throw error;
      }
    }
  }

  /**
   * Execute streaming generation with a specific model using proxy
   */
  private async* executeProxyStreamingWithModel(
    messages: Message[],
    model: string,
    config?: any
  ): AsyncGenerator<{ 
    text?: string; 
    groundingMetadata?: GroundingMetadata; 
    urlContextMetadata?: UrlContextMetadata;
  }, void, unknown> {
    
    this.totalRequests++;
    
    const lastMessage = messages[messages.length - 1];
    
    // Build the request payload for the proxy
    const requestPayload = this.buildRequestPayload(messages, model, config);
    
    // Determine the appropriate endpoint
    const endpoint = this.getApiEndpoint(model, lastMessage.files && lastMessage.files.length > 0);
    
    try {
      // Make streaming request through proxy
      const response = await this.makeProxyStreamingRequest(endpoint, requestPayload);
      
      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        if (this.currentAbortController?.signal.aborted) {
          break;
        }
        
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                yield { text: data.candidates[0].content.parts[0].text };
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
      
      this.trackKeySuccess(this.currentKeyIndex);
      
    } catch (error) {
      this.trackKeyError(this.currentKeyIndex, (error as Error).message);
      throw error;
    }
  }

  /**
   * Make a streaming request through the proxy
   */
  private async makeProxyStreamingRequest(endpoint: string, payload: any): Promise<Response> {
    const url = `${this.proxyBaseUrl}${endpoint}`;
    const apiKey = this.getCurrentApiKey();
    
    console.log(`📡 Making proxy streaming request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: this.currentAbortController?.signal,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response;
  }

  /**
   * Get the current API key
   */
  private getCurrentApiKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available. Please set API keys first.');
    }
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Move to the next API key in round-robin fashion
   */
  private moveToNextKey(): void {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`🔄 Switched to API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
  }

  /**
   * Build request payload for the API
   */
  private buildRequestPayload(messages: Message[], model: string, config?: any): any {
    const lastMessage = messages[messages.length - 1];
    
    if (messages.length === 1) {
      // Single message request
      const parts = [{ text: lastMessage.content }];
      
      // Add file attachments if present
      if (lastMessage.files && lastMessage.files.length > 0) {
        for (const file of lastMessage.files) {
          if (file.data) {
            const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
            parts.push({
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            });
          }
        }
      }
      
      return {
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: config?.generationConfig?.temperature ?? 0.7,
          topK: config?.generationConfig?.topK ?? 40,
          topP: config?.generationConfig?.topP ?? 0.95,
          maxOutputTokens: config?.generationConfig?.maxOutputTokens ?? 1000000,
        },
        ...(config?.systemInstruction && {
          systemInstruction: { parts: [{ text: config.systemInstruction }] }
        }),
      };
    } else {
      // Multi-turn conversation
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: msg.content || '' }],
      }));
      
      return {
        contents,
        generationConfig: {
          temperature: config?.generationConfig?.temperature ?? 0.7,
          topK: config?.generationConfig?.topK ?? 40,
          topP: config?.generationConfig?.topP ?? 0.95,
          maxOutputTokens: config?.generationConfig?.maxOutputTokens ?? 1000000,
        },
        ...(config?.systemInstruction && {
          systemInstruction: { parts: [{ text: config.systemInstruction }] }
        }),
      };
    }
  }

  /**
   * Get the appropriate API endpoint
   */
  private getApiEndpoint(model: string, hasFiles: boolean): string {
    const baseEndpoint = `/v1beta/models/${model}`;
    return hasFiles ? `${baseEndpoint}:generateContent` : `${baseEndpoint}:streamGenerateContent?alt=sse`;
  }

  /**
   * Categorize API errors
   */
  private categorizeApiError(error: any): { 
    category: string; 
    explanation: string; 
    suggestion: string; 
    isQuotaExhausted?: boolean;
    allowModelSwitch?: boolean;
  } {
    const errorMessage = error?.message || '';
    const errorCode = error?.status || error?.code;

    if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return {
        category: 'QUOTA_EXCEEDED',
        explanation: 'API quota limit reached.',
        suggestion: 'Wait for quota reset or upgrade plan',
        isQuotaExhausted: true,
        allowModelSwitch: true,
      };
    }

    return {
      category: 'UNKNOWN_ERROR',
      explanation: `Unexpected error: ${errorMessage}`,
      suggestion: 'Please check the error details and try again',
      allowModelSwitch: true,
    };
  }

  /**
   * Record model switch event
   */
  private recordModelSwitch(fromModel: string, toModel: string, reason: string): void {
    const switchEvent = {
      fromModel,
      toModel,
      reason,
      timestamp: new Date(),
    };
    
    this.modelSwitchHistory.push(switchEvent);
    
    if (this.modelSwitchHistory.length > 50) {
      this.modelSwitchHistory.shift();
    }
    
    if (this.onModelSwitchCallback) {
      this.onModelSwitchCallback(fromModel, toModel, reason);
    }
    
    console.log(`🔄 Model switched: ${fromModel} → ${toModel} (${reason})`);
  }

  /**
   * Track successful API key usage
   */
  private trackKeySuccess(keyIndex: number): void {
    const health = this.keyHealth.get(keyIndex);
    if (health) {
      health.successCount++;
      health.lastUsed = new Date();
      health.consecutiveErrors = 0;
      this.keyHealth.set(keyIndex, health);
    }
  }

  /**
   * Track API key errors
   */
  private trackKeyError(keyIndex: number, errorMessage: string): void {
    const health = this.keyHealth.get(keyIndex);
    if (health) {
      health.errorCount++;
      health.lastUsed = new Date();
      health.lastError = errorMessage;
      health.consecutiveErrors++;
      this.keyHealth.set(keyIndex, health);
    }
  }

  /**
   * Generate streaming response with grounding (proxy version)
   */
  async* generateStreamingResponseWithGrounding(
    messages: Message[],
    model: string = 'gemini-2.0-flash',
    config?: any
  ): AsyncGenerator<{ text?: string; groundingMetadata?: GroundingMetadata; urlContextMetadata?: UrlContextMetadata }, void, unknown> {
    // For now, delegate to the model switch version since proxy handles grounding through config
    const groundingConfig = {
      ...config,
      groundingConfig: { enabled: true },
      urlContextConfig: config?.urlContextConfig || { enabled: false }
    };
    
    yield* this.generateStreamingResponseWithModelSwitch(messages, model, groundingConfig);
  }

  /**
   * Generate response with model switch (non-streaming proxy version)
   */
  async generateResponseWithModelSwitch(
    messages: Message[],
    preferredModel: string = 'gemini-2.0-flash',
    config?: any
  ): Promise<{
    response: string | any;
    modelUsed: string;
    modelSwitched?: boolean;
    switchReason?: string;
  }> {
    
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available. Please set API keys first.');
    }

    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for generation');
    }

    console.log(`🚀 Starting proxy generation with preferred model: ${preferredModel}`);

    let currentModel = preferredModel;
    let hasTriedAlternatives = false;

    while (true) {
      try {
        console.log(`🔄 Attempting proxy generation with model: ${currentModel}`);
        this.totalRequests++;
        
        const response = await this.executeProxyGenerationWithModel(messages, currentModel, config);
        
        this.trackKeySuccess(this.currentKeyIndex);
        
        console.log(`✅ Proxy generation successful with model: ${currentModel}`);
        return {
          response,
          modelUsed: currentModel,
          modelSwitched: currentModel !== preferredModel,
          switchReason: currentModel !== preferredModel ? `Switched from ${preferredModel} due to quota limits` : undefined
        };
        
      } catch (error) {
        const errorAnalysis = this.categorizeApiError(error as Error);
        
        console.error(`❌ Model ${currentModel} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          category: errorAnalysis.category,
          isQuotaExhausted: errorAnalysis.isQuotaExhausted
        });

        if (errorAnalysis.isQuotaExhausted && !hasTriedAlternatives) {
          const nextModel = getNextBestModel(currentModel);
          
          if (nextModel) {
            const switchReason = getModelSwitchExplanation(currentModel, nextModel);
            this.recordModelSwitch(currentModel, nextModel, `Quota exhausted: ${switchReason}`);
            
            currentModel = nextModel;
            hasTriedAlternatives = true;
            continue;
          } else {
            throw new Error(`Quota exhausted for model ${currentModel} and no suitable alternatives available.`);
          }
        }
        
        throw error;
      }
    }
  }

  /**
   * Generate response with grounding (non-streaming proxy version)
   */
  async generateResponseWithGrounding(
    messages: Message[],
    model: string = 'gemini-2.0-flash',
    config?: any
  ): Promise<any> {
    const groundingConfig = {
      ...config,
      groundingConfig: { enabled: true },
      urlContextConfig: config?.urlContextConfig || { enabled: false }
    };
    
    const result = await this.generateResponseWithModelSwitch(messages, model, groundingConfig);
    return result.response;
  }

  /**
   * Analyze URLs with context understanding (proxy version)
   */
  async analyzeUrls(
    urls: string[],
    query: string,
    model: string = 'gemini-2.5-flash'
  ): Promise<{ text: string; urlContextMetadata?: UrlContextMetadata }> {
    
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available. Please set API keys first.');
    }

    if (!urls || urls.length === 0) {
      throw new Error('No URLs provided for analysis');
    }

    if (urls.length > 20) {
      throw new Error('Maximum 20 URLs allowed per request');
    }

    console.log(`🌐 Starting proxy URL analysis with model: ${model}`);
    console.log(`📝 Analyzing ${urls.length} URLs`);
    console.log(`❓ Query: ${query}`);

    // Build the analysis prompt
    const analysisPrompt = `${query}

URLs to analyze:
${urls.map((url, index) => `${index + 1}. ${url}`).join('\n')}

Please provide a comprehensive analysis based on the content of these URLs.`;

    const messages: Message[] = [{
      id: 'url-analysis',
      content: analysisPrompt,
      role: 'user',
      timestamp: new Date(),
    }];

    const config = {
      urlContextConfig: { enabled: true },
      generationConfig: {
        maxOutputTokens: 1000000,
        temperature: 0.7,
      }
    };

    try {
      const result = await this.generateResponseWithModelSwitch(messages, model, config);
      
      return {
        text: typeof result.response === 'string' ? result.response : result.response.text || 'No response',
        urlContextMetadata: result.response.urlContextMetadata
      };
    } catch (error) {
      console.error('💥 URL analysis failed:', error);
      throw error;
    }
  }

  /**
   * Execute non-streaming generation with a specific model using proxy
   */
  private async executeProxyGenerationWithModel(
    messages: Message[],
    model: string,
    config?: any
  ): Promise<string> {
    
    const lastMessage = messages[messages.length - 1];
    
    // Build the request payload for the proxy
    const requestPayload = this.buildRequestPayload(messages, model, config);
    
    // Determine the appropriate endpoint (non-streaming)
    const endpoint = `/v1beta/models/${model}:generateContent`;
    
    try {
      // Make non-streaming request through proxy
      const response = await this.makeProxyRequest(endpoint, requestPayload);
      
      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Empty response received from proxy API');
      }

      this.trackKeySuccess(this.currentKeyIndex);
      
      return response.candidates[0].content.parts[0].text;
      
    } catch (error) {
      this.trackKeyError(this.currentKeyIndex, (error as Error).message);
      throw error;
    }
  }

  /**
   * Make a non-streaming request through the proxy
   */
  private async makeProxyRequest(endpoint: string, payload: any): Promise<any> {
    const url = `${this.proxyBaseUrl}${endpoint}`;
    const apiKey = this.getCurrentApiKey();
    
    console.log(`📡 Making proxy request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: this.currentAbortController?.signal,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }

  /**
   * Stop current generation
   */
  stopGeneration(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = undefined;
      console.log('🛑 Generation stopped by user');
    }
  }

  /**
   * Set model switch callback
   */
  setModelSwitchCallback(callback: (fromModel: string, toModel: string, reason: string) => void): void {
    this.onModelSwitchCallback = callback;
  }

  /**
   * Get service statistics
   */
  getStats() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.totalRequests > 0 ? 
      ((this.totalRequests - this.totalErrors) / this.totalRequests * 100).toFixed(2) : '0';
    
    const keyStats = Array.from(this.keyHealth.entries()).map(([index, health]) => ({
      keyIndex: index + 1,
      successCount: health.successCount,
      errorCount: health.errorCount,
      successRate: health.successCount + health.errorCount > 0 ? 
        (health.successCount / (health.successCount + health.errorCount) * 100).toFixed(2) : '0',
      lastUsed: health.lastUsed,
      lastError: health.lastError,
      consecutiveErrors: health.consecutiveErrors,
      isHealthy: health.consecutiveErrors < 3
    }));

    return {
      uptime: Math.floor(uptime / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      successRate: `${successRate}%`,
      currentKeyIndex: this.currentKeyIndex + 1,
      totalKeys: this.apiKeys.length,
      keyStats,
      healthyKeys: keyStats.filter(k => k.isHealthy).length,
      timestamp: new Date().toISOString(),
      proxyEnabled: this.useProxy,
      proxyUrl: this.proxyBaseUrl
    };
  }
}

// Initialize proxy service with environment configuration
const envConfig = loadEnvConfig();
export const proxyGeminiService = new ProxyGeminiService(envConfig.apiKeys, envConfig.proxyUrl);