import { getGeminiClient } from './geminiClient';
import { ANALYSIS_PROMPT_TEMPLATE } from './prompts';
import { AIAnalysis, IClause, IRiskFlag } from '../db/models';
import { AppError } from '../utils';
import { Types } from 'mongoose';

export interface AnalysisResult {
  summary: string;
  clauses: IClause[];
  riskFlags: IRiskFlag[];
}

export class AIService {
  private modelName = 'gemini-2.5-flash';
  private modelVersion = '2.5';

  /**
   * Parse AI response and validate structure
   */
  private parseAnalysisResponse(responseText: string): AnalysisResult {
    try {
      // Clean response (remove markdown code blocks if present)
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanedText);

      // Validate structure
      if (!parsed.summary || !Array.isArray(parsed.clauses) || !Array.isArray(parsed.riskFlags)) {
        throw new Error('Invalid response structure');
      }

      return {
        summary: parsed.summary,
        clauses: parsed.clauses,
        riskFlags: parsed.riskFlags,
      };
    } catch (error) {
      throw new AppError('Failed to parse AI response', 500);
    }
  }

  /**
   * Analyze contract using Gemini AI
   */
  async analyzeContract(
    contractVersionId: string,
    canonicalText: string
  ): Promise<{ analysisId: string }> {
    // Check if analysis already exists
    const existingAnalysis = await AIAnalysis.findOne({
      contractVersionId: new Types.ObjectId(contractVersionId),
    });

    if (existingAnalysis) {
      return { analysisId: existingAnalysis._id.toString() };
    }

    // Prepare prompt
    const prompt = ANALYSIS_PROMPT_TEMPLATE.replace('{contractText}', canonicalText);

    try {
      // Call Gemini API using new pattern
      const ai = getGeminiClient();
      
      console.log('Calling Gemini API with model:', this.modelName);
      
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const responseText = response.text;

      if (!responseText) {
        throw new AppError('Empty response from AI model', 500);
      }

      // Parse response
      const analysisResult = this.parseAnalysisResponse(responseText);

      // Store analysis in database
      const analysis = await AIAnalysis.create({
        contractVersionId: new Types.ObjectId(contractVersionId),
        summary: analysisResult.summary,
        clauses: analysisResult.clauses,
        riskFlags: analysisResult.riskFlags,
        modelName: this.modelName,
        modelVersion: this.modelVersion,
        analyzedAt: new Date(),
      });

      return { analysisId: analysis._id.toString() };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new AppError(`AI analysis failed: ${error.message}`, 500);
    }
  }

  /**
   * Get analysis results for a contract version
   */
  async getAnalysis(contractVersionId: string) {
    const analysis = await AIAnalysis.findOne({
      contractVersionId: new Types.ObjectId(contractVersionId),
    });

    if (!analysis) {
      throw new AppError('Analysis not found for this contract version', 404);
    }

    return analysis;
  }

  /**
   * Generate content using Gemini AI with custom prompt and system instruction
   */
  async generateContent(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const ai = getGeminiClient();

      console.log('Calling Gemini API with model:', this.modelName);

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        systemInstruction: systemInstruction,
      });

      const responseText = response.text;

      if (!responseText) {
        throw new AppError('Empty response from AI model', 500);
      }

      return responseText;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new AppError(`AI generation failed: ${error.message}`, 500);
    }
  }
}
