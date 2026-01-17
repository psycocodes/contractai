import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  uploadContract,
  getContract,
  getContractVersions,
  getVersion,
  verifyContract,
} from '../contracts/contractController';
import {
  getCanonicalText,
  analyzeContract,
  getAnalysis,
} from '../contracts/aiController';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}. Make sure to send file with field name 'file'.`,
    });
  }
  next(err);
};

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Contract upload route
router.post('/contracts/upload', upload.single('file'), handleMulterError, uploadContract);

// Contract verify route
router.post('/contracts/verify', upload.single('file'), handleMulterError, verifyContract);

// Get contract by ID
router.get('/contracts/:contractId', getContract);

// Get all versions of a contract
router.get('/contracts/:contractId/versions', getContractVersions);

// Get specific version by ID
router.get('/versions/:versionId', getVersion);

// Get canonical text for a version
router.get('/versions/:versionId/canonical', getCanonicalText);

// Trigger AI analysis for a version
router.post('/versions/:versionId/analyze', analyzeContract);

// Get AI analysis results for a version
router.get('/versions/:versionId/analysis', getAnalysis);

export default router;
