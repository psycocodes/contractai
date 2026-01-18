import { Contract } from '../db/models/Contract';
import { ContractVersion } from '../db/models/ContractVersion';
import { CanonicalizationService } from '../services/CanonicalizationService';
// import { HashingService } from '../services/HashingService'; // No longer needed for registration
import { BlockchainService } from '../services/BlockchainService';
import { AppError } from '../utils';
import { canonicalizeContract } from '../utils/canonicalization';
import { Types } from 'mongoose';
import { ethers } from 'ethers'; // For local Keccak check

export interface UploadResult {
  contractId: string;
  versionId: string;
  contractHash: string;
  onChainTxHash?: string;
}

export interface VerificationResult {
  contractId: string;
  versionId: string;
  submittedHash: string;
  onChainHash: string | null;
  status: 'VERIFIED' | 'VERSION_MISMATCH' | 'NOT_VERIFIED' | 'NOT_FOUND';
  details?: string;
}

export class ContractService {
  /**
   * Get the next version number for a contract
   */
  private async getNextVersionNumber(contractId: Types.ObjectId): Promise<number> {
    const latestVersion = await ContractVersion.findOne({ contractId })
      .sort({ versionNumber: -1 })
      .select('versionNumber');
    
    return latestVersion ? latestVersion.versionNumber + 1 : 1;
  }

  /**
   * Upload a new contract or new version of existing contract
   */
  async uploadContract(
    fileName: string,
    fileType: string,
    buffer: Buffer,
    organizationId: string,
    contractId?: string
  ): Promise<UploadResult> {
    // 1. Canonicalize Content
    const canonicalContent = await CanonicalizationService.canonicalize(buffer, fileName, fileType);
    
    if (!canonicalContent || canonicalContent.length === 0) {
      throw new AppError('Could not canonicalize document content', 400);
    }

    // 2. Generate Hash (For DB storage only, we let chain do the real work)
    // We compute Keccak256 locally just to store it in DB for quick reference
    const contractHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalContent));
    const rawText = canonicalContent; // For simple storage, we use canonical as rawText too or extracted text

    let contract;

    // Create or retrieve contract parent
    if (contractId) {
      contract = await Contract.findOne({ _id: contractId, organizationId });
      if (!contract) {
        throw new AppError('Contract not found or access denied', 404);
      }
    } else {
      contract = await Contract.create({
        name: fileName,
        organizationId,
      });
    }

    // Get next version number
    const versionNumber = await this.getNextVersionNumber(contract._id as Types.ObjectId);

    // Debug: Log what we're about to save
    console.log('About to save to DB:', {
      hasRawText: !!rawText,
      rawTextLength: rawText?.length,
      hasCanonicalContent: !!canonicalContent,
      canonicalContentLength: canonicalContent?.length,
    });

    const versionStr = `v${versionNumber}`;
    
    // 3. Register on Real Blockchain (Sends CONTENT)
    const txHash = await BlockchainService.registerContract(
       contract._id.toString(),
       versionStr,
       canonicalContent,
       "1.0", 
       "Keccak-256" 
    );

    // 4. Store in DB
    const contractVersion = await ContractVersion.create({
      contractId: contract._id,
      versionNumber,
      fileName,
      fileType,
      rawText,
      contractHash,
      canonicalContent,
      onChainTxHash: txHash,
      uploadedAt: new Date(),
    });

    // Debug: Check what was actually saved
    console.log('After save:', {
      hasRawText: !!contractVersion.rawText,
      rawTextLength: contractVersion.rawText?.length,
      hasCanonicalContent: !!contractVersion.canonicalContent,
      canonicalContentLength: contractVersion.canonicalContent?.length,
    });

    return {
      contractId: contract._id.toString(),
      versionId: contractVersion._id.toString(),
      contractHash,
      onChainTxHash: txHash
    };
  }

  /**
   * Verify a submitted document against a registered contract
   */
  async verifyContract(
    file: Express.Multer.File,
    contractId: string,
    organizationId: string,
    versionId?: string
  ): Promise<VerificationResult> {
    // 1. Find contract
    const contract = await Contract.findOne({ _id: contractId, organizationId });
    if (!contract) {
       throw new AppError('Contract not found or access denied', 404);
    }

    // 2. Canonicalize & Hash submitted file
    const canonicalContent = await CanonicalizationService.canonicalize(
        file.buffer, 
        file.originalname, 
        file.mimetype.includes('pdf') ? 'pdf' : 'txt'
    );
    // Use Keccak-256 to match on-chain algo
    const submittedHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalContent));

    // 3. Determine Version to Verify Against
    let targetVersionStr: string;
    let dbVersionId: string = 'unknown';

    if (versionId) {
        targetVersionStr = versionId; // User claims "v2" or just "2"? We'll handle input
    } else {
        // Fallback to latest
        const latestVersion = await ContractVersion.findOne({ contractId })
          .sort({ versionNumber: -1 });
        
        if (!latestVersion) {
             return {
                contractId,
                versionId: 'unknown',
                submittedHash,
                onChainHash: null,
                status: 'NOT_FOUND',
                details: 'No versions registered for this contract'
            };
        }
        targetVersionStr = `v${latestVersion.versionNumber}`;
        dbVersionId = latestVersion._id.toString();
    }

    // 4. Fetch Hash from Blockchain
    const onChainHash = await BlockchainService.getHash(contractId, targetVersionStr);
    
    if (!onChainHash) {
         return {
            contractId,
            versionId: dbVersionId,
            submittedHash,
            onChainHash: null,
            status: 'NOT_VERIFIED', // or NOT_FOUND
            details: `Hash for version ${targetVersionStr} not found on-chain`
        };
    }

    // 5. Compare
    if (submittedHash === onChainHash) {
        return {
            contractId,
            versionId: versionId || dbVersionId,
            submittedHash,
            onChainHash,
            status: 'VERIFIED'
        };
    } else {
        return {
            contractId,
            versionId: versionId || dbVersionId,
            submittedHash,
            onChainHash,
            status: 'VERSION_MISMATCH',
            details: `Document hash does not match the on-chain record for ${targetVersionStr}`
        };
    }
  }

  async getContracts(organizationId: string) {
    const contracts = await Contract.find({ organizationId })
      .sort({ createdAt: -1 });
    return contracts;
  }

  async getContractById(contractId: string, organizationId: string) {
    const contract = await Contract.findOne({ _id: contractId, organizationId });
    if (!contract) {
      throw new AppError('Contract not found or access denied', 404);
    }
    return contract;
  }

  async getContractVersions(contractId: string, organizationId: string) {
    // First verify contract belongs to organization
    await this.getContractById(contractId, organizationId);
    
    const versions = await ContractVersion.find({ contractId })
      .sort({ versionNumber: -1 });
    return versions;
  }

  async getVersionById(versionId: string, organizationId: string) {
    const version = await ContractVersion.findById(versionId).populate('contractId');
    if (!version) {
      throw new AppError('Version not found', 404);
    }
    
    // Verify the contract belongs to the organization
    const contract = await Contract.findOne({ 
      _id: version.contractId, 
      organizationId 
    });
    
    if (!contract) {
      throw new AppError('Access denied to this version', 403);
    }
    
    return version;
  }
}
