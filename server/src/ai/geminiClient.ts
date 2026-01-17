import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

/**
 * Initialize Gemini client
 */
export function initializeGeminiClient(): void {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  genAI = new GoogleGenAI({ apiKey });
}

/**
 * Get Gemini client instance
 */
export function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    throw new Error('Gemini client not initialized. Call initializeGeminiClient() first.');
  }

  return genAI;
}
