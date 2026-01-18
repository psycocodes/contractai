import { Response } from 'express';
import { ContractService } from './contractService';
import { asyncHandler, AppError } from '../utils';
import { AuthRequest } from '../auth/authMiddleware';

const contractService = new ContractService();

export const getContracts = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const contracts = await contractService.getContracts(req.activeOrganizationId);

    res.status(200).json({
      success: true,
      data: contracts,
    });
  }
);

export const uploadContract = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const { originalname, buffer, mimetype } = req.file;
    const { contractId } = req.body;

    // Determine file type from mimetype or filename
    let fileType: string;
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      fileType = 'docx';
    } else if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
      fileType = 'txt';
    } else {
      throw new AppError('Unsupported file type. Only PDF, DOCX, and TXT are allowed.', 400);
    }

    const result = await contractService.uploadContract(
      originalname,
      fileType,
      buffer,
      req.activeOrganizationId,
      contractId
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  }
);

export const verifyContract = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
        throw new AppError('No file uploaded for verification', 400);
    }

    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    // contractId is required to know what we are verifying against
    // passed as form-data field
    const { contractId, versionId } = req.body;
    if (!contractId) {
        throw new AppError('Contract ID is required for verification', 400);
    }

    const result = await contractService.verifyContract(
        req.file,
        contractId,
        req.activeOrganizationId,
        versionId
    );

    res.status(200).json({
        success: true,
        data: result
    });
  }
);

export const getContract = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const contractId = req.params.contractId as string;

    const contract = await contractService.getContractById(
      contractId, 
      req.activeOrganizationId
    );

    res.status(200).json({
      success: true,
      data: contract,
    });
  }
);

export const getContractVersions = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const contractId = req.params.contractId as string;

    const versions = await contractService.getContractVersions(
      contractId, 
      req.activeOrganizationId
    );

    res.status(200).json({
      success: true,
      data: versions,
    });
  }
);

export const getVersion = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.activeOrganizationId) {
      throw new AppError('Active organization required', 400);
    }

    const versionId = req.params.versionId as string;

    const version = await contractService.getVersionById(
      versionId, 
      req.activeOrganizationId
    );

    res.status(200).json({
      success: true,
      data: version,
    });
  }
);
