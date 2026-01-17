import crypto from 'crypto';

export class HashingService {
  /**
   * Generates a SHA-256 hash of the given content
   * @param content The content to hash
   * @returns The hexadecimal hash string
   */
  static generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
