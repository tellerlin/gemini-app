import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import type { Message, FileAttachment } from '../types/chat';

/**
 * Enhanced Gemini Service with comprehensive error handling and timeout management
 * Uses the latest Google Generative AI SDK with proper error categorization
 * Supports multiple API keys with round-robin functionality
 */
export class GeminiService {
  private apiKeys: string[] = [];
  private currentKeyIndex: number = 0;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;

  constructor(apiKeys?: string[]) {
    if (apiKeys && apiKeys.length > 0) {
      this.setApiKeys(apiKeys);
    }
  }

  /**
   * Set multiple API keys for round-robin functionality
   * @param apiKeys - Array of Gemini API keys from Google AI Studio
   */
  setApiKeys(apiKeys: string[]): void {
    try {
      this.apiKeys = apiKeys.filter(key => key.trim() !== '');
      this.currentKeyIndex = 0;
      console.log(`✅ Gemini API client initialized with ${this.apiKeys.length} API keys`);
    } catch (error) {
      console.error('❌ Failed to initialize Gemini API client:', error);
      throw new Error(`Failed to initialize Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current API key
   * @private
   */
  private getCurrentApiKey(): string {
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available. Please set API keys first.');
    }
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Move to the next API key in round-robin fashion
   * @private
   */
  private moveToNextKey(): void {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    console.log(`🔄 Switched to API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
  }

  /**
   * Create a new GoogleGenerativeAI instance with the current API key
   * @private
   */
  private createGenAI(): GoogleGenerativeAI {
    const apiKey = this.getCurrentApiKey();
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate response from Gemini AI with comprehensive error handling and multiple API key support
   * @param messages - Array of conversation messages
   * @param model - Model to use (defaults to gemini-2.5-flash)
   * @returns Promise<string> - The AI response
   */
  async generateResponse(
    messages: Message[],
    model: string = 'gemini-2.5-flash'
  ): Promise<string> {
    // Validate prerequisites
    if (this.apiKeys.length === 0) {
      const error = new Error('No API keys available. Please set API keys first.');
      console.error('❌ API Key Error:', error.message);
      throw error;
    }

    if (!messages || messages.length === 0) {
      const error = new Error('No messages provided for generation');
      console.error('❌ Input Validation Error:', error.message);
      throw error;
    }

    console.log(`🚀 Starting content generation with model: ${model}`);
    console.log(`📝 Processing ${messages.length} messages`);
    console.log(`🔑 Using ${this.apiKeys.length} API keys in round-robin mode`);

    let lastError: Error | null = null;
    const initialKeyIndex = this.currentKeyIndex;

    // Try each API key until one succeeds
    do {
      try {
        console.log(`🔑 Attempting with API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`);
        const result = await this.executeGenerationWithRetries(messages, model);
        console.log('✅ Content generation successful');
        console.log(`📊 Response length: ${result.length} characters`);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ API key ${this.currentKeyIndex + 1} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof Error ? error.constructor.name : 'Unknown'
        });

        // Check if this is a non-retryable error for this specific key
        if (this.isNonRetryableError(error as Error)) {
          console.log('🚫 Non-retryable error detected, trying next API key');
        }

        // Move to next key
        this.moveToNextKey();

        // If we've tried all keys, break
        if (this.currentKeyIndex === initialKeyIndex) {
          console.log('💥 All API keys have been tried');
          break;
        }
      }
    } while (this.currentKeyIndex !== initialKeyIndex);

    // All API keys exhausted
    console.error('💥 All API keys failed');
    throw lastError || new Error('Failed to generate response with any API key');
  }

  /**
   * Execute generation with retries for a single API key
   * @private
   */
  private async executeGenerationWithRetries(messages: Message[], model: string): Promise<string> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.MAX_RETRIES) {
      attempt++;
      console.log(`🔄 Retry attempt ${attempt}/${this.MAX_RETRIES} for current API key`);

      try {
        const result = await this.executeGeneration(messages, model);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Retry attempt ${attempt} failed:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          type: error instanceof Error ? error.constructor.name : 'Unknown'
        });

        // Don't retry for certain error types
        if (this.isNonRetryableError(error as Error)) {
          console.log('🚫 Non-retryable error detected, stopping retries for this key');
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('Failed to generate response after multiple attempts with current API key');
  }

  /**
   * Execute the actual content generation with timeout handling
   * @private
   */
  private async executeGeneration(messages: Message[], model: string): Promise<string> {
    const genAI = this.createGenAI();
    const generativeModel: GenerativeModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const lastMessage = messages[messages.length - 1];
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.DEFAULT_TIMEOUT}ms`));
      }, this.DEFAULT_TIMEOUT);
    });

    try {
      if (lastMessage.files && lastMessage.files.length > 0) {
        console.log(`📎 Processing ${lastMessage.files.length} file attachments`);
        return await Promise.race([
          this.handleMultimodalGeneration(generativeModel, lastMessage),
          timeoutPromise
        ]);
      } else {
        console.log('💬 Processing text-only conversation');
        return await Promise.race([
          this.handleTextGeneration(generativeModel, messages),
          timeoutPromise
        ]);
      }
    } catch (error) {
      this.categorizeAndLogError(error as Error);
      throw error;
    }
  }

  /**
   * Handle multimodal generation (text + files)
   * @private
   */
  private async handleMultimodalGeneration(
    model: GenerativeModel, 
    message: Message
  ): Promise<string> {
    const parts: any[] = [{ text: message.content }];
    
    for (const file of message.files!) {
      if (file.type.startsWith('image/')) {
        console.log(`🖼️ Processing image: ${file.name} (${file.type})`);
        
        if (!file.data) {
          throw new Error(`Image data missing for file: ${file.name}`);
        }

        // Remove data URL prefix if present
        const base64Data = file.data.includes(',') 
          ? file.data.split(',')[1] 
          : file.data;

        parts.push({
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        });
      } else {
        console.log(`📄 Skipping non-image file: ${file.name} (${file.type})`);
      }
    }

    console.log(`🔧 Generating content with ${parts.length} parts`);
    const result = await model.generateContent(parts);
    const response = result.response;
    
    if (!response) {
      throw new Error('Empty response received from Gemini API');
    }

    return response.text();
  }

  /**
   * Handle text-only generation with conversation history
   * @private
   */
  private async handleTextGeneration(
    model: GenerativeModel, 
    messages: Message[]
  ): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    
    if (messages.length === 1) {
      // Single message - use generateContent
      console.log('📝 Single message generation');
      const result = await model.generateContent(lastMessage.content);
      return result.response.text();
    } else {
      // Multi-turn conversation - use chat session
      console.log('💭 Multi-turn conversation generation');
      
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: msg.content }],
      }));

      console.log(`📚 Chat history: ${history.length} messages`);
      
      const chat: ChatSession = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    }
  }

  /**
   * Categorize and log errors with detailed information
   * @private
   */
  private categorizeAndLogError(error: Error): void {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    if (error.message.includes('timeout')) {
      console.error('⏰ TIMEOUT ERROR:', errorInfo);
    } else if (error.message.includes('API_KEY') || error.message.includes('401')) {
      console.error('🔑 AUTHENTICATION ERROR:', errorInfo);
    } else if (error.message.includes('quota') || error.message.includes('429')) {
      console.error('📊 QUOTA/RATE LIMIT ERROR:', errorInfo);
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.error('🌐 NETWORK ERROR:', errorInfo);
    } else if (error.message.includes('400') || error.message.includes('invalid')) {
      console.error('📝 REQUEST ERROR:', errorInfo);
    } else if (error.message.includes('500') || error.message.includes('503')) {
      console.error('🔧 SERVER ERROR:', errorInfo);
    } else {
      console.error('❓ UNKNOWN ERROR:', errorInfo);
    }
  }

  /**
   * Determine if an error should not be retried
   * @private
   */
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      'API_KEY',
      '401',
      '400',
      'invalid',
      'malformed',
      'unauthorized'
    ];

    return nonRetryablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Utility function to create delays
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get available models with their capabilities
   * @returns Array of model information
   */
  getAvailableModels() {
    return [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more',
        supportsVision: true,
        supportsAudio: true,
        supportsVideo: true,
        supportsPdf: true,
        maxTokens: 8192
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Adaptive thinking, cost efficiency',
        supportsVision: true,
        supportsAudio: true,
        supportsVideo: true,
        maxTokens: 8192
      },
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        description: 'Most cost-efficient model supporting high throughput',
        supportsVision: true,
        supportsAudio: true,
        supportsVideo: true,
        maxTokens: 8192
      },
      {
        id: 'gemini-live-2.5-flash-preview',
        name: 'Gemini 2.5 Flash Live',
        description: 'Low-latency bidirectional voice and video interactions',
        supportsVision: false,
        supportsAudio: true,
        supportsVideo: true,
        maxTokens: 8192
      }
    ];
  }

  /**
   * Test the API connection and configuration
   * @returns Promise<boolean> - True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Gemini API connection...');
      
      if (this.apiKeys.length === 0) {
        throw new Error('No API keys available for connection test.');
      }

      const apiKey = this.getCurrentApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent('Hello, this is a connection test.');
      
      console.log('✅ Connection test successful');
      console.log('📝 Test response:', result.response.text().substring(0, 100) + '...');
      
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      this.categorizeAndLogError(error as Error);
      return false;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();