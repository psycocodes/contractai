import mammoth from 'mammoth';

// pdf-parse v2 import
const { PDFParse } = require('pdf-parse');

/**
 * Extract text from PDF buffer using pdf-parse
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  parser.destroy();
  return result.text;
}

/**
 * Extract text from DOCX buffer using mammoth
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from plain text buffer
 */
function extractTxtText(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Normalize text to create canonical form
 * 
 * Canonicalization rules:
 * - Collapse multiple spaces to single space
 * - Normalize line breaks to '\n'
 * - Trim leading and trailing whitespace
 * - Remove excessive blank lines
 * - Ensure UTF-8 encoding
 */
function normalizeText(text: string): string {
  let normalized = text;

  // Normalize line breaks (Windows \r\n, Mac \r to Unix \n)
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse multiple spaces to single space (but preserve single newlines)
  normalized = normalized.replace(/[ \t]+/g, ' ');

  // Remove excessive blank lines (more than 2 consecutive newlines)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Trim leading and trailing whitespace from each line
  normalized = normalized
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  // Trim overall leading and trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Extract and canonicalize text from a file buffer
 * 
 * @param buffer - File buffer
 * @param fileType - File type (pdf, docx, txt)
 * @returns Canonical text (normalized and deterministic)
 */
export async function canonicalizeContract(
  buffer: Buffer,
  fileType: string
): Promise<{ rawText: string; canonicalContent: string }> {
  let rawText: string;

  // Extract text based on file type
  switch (fileType) {
    case 'pdf':
      rawText = await extractPdfText(buffer);
      break;

    case 'docx':
      rawText = await extractDocxText(buffer);
      break;

    case 'txt':
      rawText = extractTxtText(buffer);
      break;

    default:
      throw new Error(`Unsupported file type for canonicalization: ${fileType}`);
  }

  // Normalize to create canonical text
  const canonicalText = normalizeText(rawText);

  return {
    rawText,
    canonicalContent: canonicalText,
  };
}
