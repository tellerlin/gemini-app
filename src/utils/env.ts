// Environment variable utilities for API key management

export interface EnvConfig {
  GEMINI_API_KEYS?: string;
}

/**
 * Parse API keys from environment variable or comma-separated string
 */
export function parseApiKeys(keysString: string): string[] {
  if (!keysString) return [];
  
  return keysString
    .split(',')
    .map(key => key.trim())
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
 * Validate API key format (basic validation)
 */
export function validateApiKey(key: string): boolean {
  // Basic validation for Gemini API keys
  // They typically start with "AI" and are around 40 characters long
  return key.length > 20 && key.length < 100;
}

/**
 * Get masked version of API key for display
 */
export function maskApiKey(key: string): string {
  if (key.length <= 6) return '*'.repeat(key.length);
  return '*'.repeat(key.length - 6) + key.slice(-6);
} 