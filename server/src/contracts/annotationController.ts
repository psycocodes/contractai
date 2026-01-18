import { Response } from 'express';
import { AuthRequest } from '../auth/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { ContractVersion, Annotation, AnnotationType, AIAnalysis } from '../db/models';
import { AIService } from '../ai/aiService';
import { ANNOTATION_SYSTEM_PROMPT, ANNOTATION_PROMPT_TEMPLATE } from '../ai/prompts';

const aiService = new AIService();

/**
 * Generate AI annotations for a contract version
 * POST /versions/:versionId/annotate
 */
export const generateAnnotations = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { versionId } = req.params;

  // Fetch contract version with canonical text
  const version = await ContractVersion.findById(versionId);
  if (!version) {
    throw new AppError('Contract version not found', 404);
  }

  if (!version.canonicalContent) {
    throw new AppError('Canonical text not available for this version', 400);
  }

  // Fetch existing AI analysis
  const analysis = await AIAnalysis.findOne({ contractVersionId: versionId });
  if (!analysis) {
    throw new AppError('AI analysis not found. Please analyze the contract first.', 400);
  }

  // Prepare analysis summary for prompt
  const analysisSummary = JSON.stringify({
    summary: analysis.summary,
    clauses: analysis.clauses,
    riskFlags: analysis.riskFlags,
  }, null, 2);

  // Generate prompt
  const prompt = ANNOTATION_PROMPT_TEMPLATE
    .replace('{contractText}', version.canonicalContent)
    .replace('{analysis}', analysisSummary);

  // Call Gemini AI
  const aiResponse = await aiService.generateContent(prompt, ANNOTATION_SYSTEM_PROMPT);

  // Parse response
  let annotationsData: any[];
  try {
    // Clean response (remove markdown code blocks if present)
    let cleanedText = aiResponse.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    annotationsData = JSON.parse(cleanedText);
    if (!Array.isArray(annotationsData)) {
      throw new Error('Response is not an array');
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', aiResponse);
    throw new AppError('Failed to parse AI annotations response', 500);
  }

  // Validate and save annotations
  const textLength = version.canonicalContent.length;
  const validAnnotations = annotationsData.filter((ann) => {
    return (
      typeof ann.startOffset === 'number' &&
      typeof ann.endOffset === 'number' &&
      ann.startOffset >= 0 &&
      ann.endOffset <= textLength &&
      ann.startOffset < ann.endOffset &&
      ['CLAUSE', 'RISK', 'NOTE'].includes(ann.type) &&
      typeof ann.content === 'string' &&
      ann.content.length > 0
    );
  });

  // Delete existing annotations for this version
  await Annotation.deleteMany({ contractVersionId: versionId });

  // Create new annotations
  const annotations = await Annotation.insertMany(
    validAnnotations.map((ann) => ({
      contractVersionId: versionId,
      startOffset: ann.startOffset,
      endOffset: ann.endOffset,
      type: ann.type as AnnotationType,
      content: ann.content,
    }))
  );

  res.status(201).json({
    success: true,
    data: {
      count: annotations.length,
      annotations,
    },
  });
});

/**
 * Get annotations for a contract version
 * GET /versions/:versionId/annotations
 */
export const getAnnotations = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { versionId } = req.params;

  // Verify version exists
  const version = await ContractVersion.findById(versionId);
  if (!version) {
    throw new AppError('Contract version not found', 404);
  }

  // Fetch annotations sorted by startOffset
  const annotations = await Annotation.find({ contractVersionId: versionId }).sort({ startOffset: 1 });

  res.status(200).json({
    success: true,
    data: annotations,
  });
});
