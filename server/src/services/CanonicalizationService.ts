import fs from 'fs';
import path from 'path';
import { AppError } from '../utils';

// pdf-parse v2 import
const { PDFParse } = require('pdf-parse');

export class CanonicalizationService {
  /**
   * Canonicalizes the document content.
   * Extracts text from PDF or assumes text for other types, then normalizes.
   * 
   * @param buffer File buffer
   * @param fileName File name
   * @param fileType File type
   * @returns Canonicalized string
   */
  static async canonicalize(
    buffer: Buffer,
    fileName: string,
    fileType: string
  ): Promise<string> {
    let content = '';

    try {
        if (fileType === 'pdf') {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            parser.destroy();
            content = result.text;
        } else {
            // Assume text/plain or similar
            content = buffer.toString('utf-8');
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        throw new AppError('Failed to parse document content', 500);
    }

    return this.normalize(content);
  }

  /**
   * Normalizes text by trimming and ensuring standard line endings
   */
  private static normalize(text: string): string {
    if (!text) return '';

    // Normalize newlines to \n
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Collapse multiple spaces/newlines? 
    // For strict canonicalization, we might want to be aggressive, 
    // but for now, simple trim + newline normalization is safer.
    
    // Trim whitespace from ends
    normalized = normalized.trim();
    
    return normalized;
  }
}
