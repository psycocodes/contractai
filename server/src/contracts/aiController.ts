import { Response } from 'express';
import { AIService } from '../ai/aiService';
import { ContractVersion, Contract } from '../db/models';
import { asyncHandler, AppError, logger } from '../utils';
import { AuthRequest } from '../auth/authMiddleware';

const aiService = new AIService();

/**
 * Get canonical text for a contract version
 */
export const getCanonicalText = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const versionId = req.params.versionId as string;

    const version = await ContractVersion.findById(versionId).populate('contractId');
    if (!version) {
      throw new AppError('Contract version not found', 404);
    }

    // Verify organization access
    const contract = await Contract.findOne({ 
      _id: version.contractId, 
      organizationId: req.activeOrganizationId 
    });
    
    if (!contract) {
      throw new AppError('Access denied to this version', 403);
    }

    // Debug logging
    logger.info('Version found:', {
      id: version._id,
      hasCanonicalContent: !!version.canonicalContent,
      canonicalContentLength: version.canonicalContent?.length || 0,
      hasRawText: !!version.rawText,
      rawTextLength: version.rawText?.length || 0,
    });

    res.status(200).json({
      success: true,
      data: {
        versionId: version._id,
        canonicalContent: version.canonicalContent || null,
        fileName: version.fileName,
        versionNumber: version.versionNumber,
      },
    });
  }
);

/**
 * Trigger AI analysis for a contract version
 */
export const analyzeContract = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const versionId = req.params.versionId as string;

    // Fetch contract version
    const version = await ContractVersion.findById(versionId).populate('contractId');
    if (!version) {
      throw new AppError('Contract version not found', 404);
    }

    // Verify organization access
    const contract = await Contract.findOne({ 
      _id: version.contractId, 
      organizationId: req.activeOrganizationId 
    });
    
    if (!contract) {
      throw new AppError('Access denied to this version', 403);
    }

    // Call AI service
    const result = await aiService.analyzeContract(
      version._id.toString(),
      version.canonicalContent
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Get AI analysis results for a contract version
 */
export const getAnalysis = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const versionId = req.params.versionId as string;

    // First, verify access to the version
    const version = await ContractVersion.findById(versionId).populate('contractId');
    if (!version) {
      throw new AppError('Contract version not found', 404);
    }

    // Verify organization access
    const contract = await Contract.findOne({ 
      _id: version.contractId, 
      organizationId: req.activeOrganizationId 
    });
    
    if (!contract) {
      throw new AppError('Access denied to this version', 403);
    }

    const analysis = await aiService.getAnalysis(versionId);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  }
);
