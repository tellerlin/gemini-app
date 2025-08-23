import { describe, it, expect } from 'vitest';
import { parseApiKeys, validateApiKey, maskApiKey } from '../utils/env';

describe('parseApiKeys', () => {
  it('should parse comma-separated API keys', () => {
    const input = 'key1,key2,key3';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should remove all whitespace characters', () => {
    const input = ' key1 , key2\t,\nkey3 ';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should remove single quotes', () => {
    const input = "'key1','key2',key3";
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should remove double quotes', () => {
    const input = '"key1","key2",key3';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should remove backticks', () => {
    const input = '`key1`,`key2`,key3';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should handle mixed quotes and whitespace', () => {
    const input = ' "key1" , \'key2\' ,\t`key3` ';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should filter out empty keys', () => {
    const input = 'key1,,key3,';
    const result = parseApiKeys(input);
    expect(result).toEqual(['key1', 'key3']);
  });

  it('should handle complex real-world scenarios', () => {
    const input = ' "AIza123abc" , \'AIza456def\' ,\tAIza789ghi, , "AIza000jkl" ';
    const result = parseApiKeys(input);
    expect(result).toEqual(['AIza123abc', 'AIza456def', 'AIza789ghi', 'AIza000jkl']);
  });

  it('should return empty array for empty input', () => {
    const result = parseApiKeys('');
    expect(result).toEqual([]);
  });

  it('should return empty array for whitespace-only input', () => {
    const result = parseApiKeys('   ');
    expect(result).toEqual([]);
  });

  it('should handle input with only commas and quotes', () => {
    const input = '","\'`,';
    const result = parseApiKeys(input);
    expect(result).toEqual([]);
  });
});

describe('validateApiKey', () => {
  it('should validate valid API key length', () => {
    const validKey = 'AIzaSyC1234567890abcdefg'; // 25 characters
    expect(validateApiKey(validKey)).toBe(true);
  });

  it('should reject keys that are too short', () => {
    const shortKey = 'short';
    expect(validateApiKey(shortKey)).toBe(false);
  });

  it('should reject keys that are too long', () => {
    const longKey = 'a'.repeat(101);
    expect(validateApiKey(longKey)).toBe(false);
  });
});

describe('maskApiKey', () => {
  it('should mask API key showing only last 6 characters', () => {
    const key = 'AIzaSyC1234567890abcdefg'; // 24 characters total
    const masked = maskApiKey(key);
    expect(masked).toBe('******************bcdefg'); // 18 stars + last 6 chars
  });

  it('should handle short keys', () => {
    const key = 'short';
    const masked = maskApiKey(key);
    expect(masked).toBe('*****');
  });

  it('should handle keys exactly 6 characters', () => {
    const key = 'AIzaBC';
    const masked = maskApiKey(key);
    expect(masked).toBe('******');
  });
});