// Environment variable utilities for API key management and proxy configuration

export interface EnvConfig {
  GEMINI_API_KEYS?: string;
  PROXY_URL?: string;
  DEFAULT_MODEL?: string;
  REQUEST_TIMEOUT?: string;
  MAX_RETRIES?: string;
}

/**
 * Parse API keys from environment variable or comma-separated string
 * Automatically removes all whitespace (including spaces, tabs, newlines)
 */
export function parseApiKeys(keysString: string): string[] {
  if (!keysString) return [];
  
  return keysString
    .split(',')
    .map(key => key.replace(/\s+/g, '')) // Remove ALL whitespace characters
    .filter(key => key !== '');
}

/**
 * Load API keys from environment variables
 * In a browser environment, this would typically come from a .env file
 * or be injected during build time
 */
export function loadApiKeysFromEnv(): string[] {
  // In a Vite environment, environment variables are prefixed with VITE_
  const envKeys = import.meta.env.VITE_GEMINI_API_KEYS;
  
  if (envKeys) {
    return parseApiKeys(envKeys);
  }
  
  return [];
}

/**
 * Load proxy URL from environment variables
 */
export function loadProxyFromEnv(): string | undefined {
  const proxyUrl = import.meta.env.VITE_PROXY_URL;
  
  if (proxyUrl && proxyUrl.trim() !== '') {
    return proxyUrl.trim();
  }
  
  return undefined;
}

/**
 * Load default model from environment variables
 */
export function loadDefaultModelFromEnv(): string {
  return import.meta.env.VITE_DEFAULT_MODEL || 'gemini-2.5-flash';
}

/**
 * Load request timeout from environment variables
 */
export function loadRequestTimeoutFromEnv(): number {
  const timeout = import.meta.env.VITE_REQUEST_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 30000;
}

/**
 * Load max retries from environment variables
 */
export function loadMaxRetriesFromEnv(): number {
  const retries = import.meta.env.VITE_MAX_RETRIES;
  return retries ? parseInt(retries, 10) : 3;
}

/**
 * Load all environment configuration
 */
export function loadEnvConfig(): {
  apiKeys: string[];
  proxyUrl?: string;
  defaultModel: string;
  requestTimeout: number;
  maxRetries: number;
} {
  return {
    apiKeys: loadApiKeysFromEnv(),
    proxyUrl: loadProxyFromEnv(),
    defaultModel: loadDefaultModelFromEnv(),
    requestTimeout: loadRequestTimeoutFromEnv(),
    maxRetries: loadMaxRetriesFromEnv(),
  };
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKey(key: string): boolean {
  // Basic validation for Gemini API keys
  // They typically start with "AI" and are around 40 characters long
  return key.length > 20 && key.length < 100;
}

/**
 * Validate proxy URL format
 */
export function validateProxyUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get masked version of API key for display
 * Shows only the last 6 characters with asterisks for the rest
 */
export function maskApiKey(key: string): string {
  if (key.length <= 6) return '*'.repeat(key.length);
  return '*'.repeat(key.length - 6) + key.slice(-6);
} 