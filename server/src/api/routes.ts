import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  uploadContract,
  getContracts,
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
import { register, login, getCurrentUser } from '../auth/authController';
import {
  createOrganization,
  getUserOrganizations,
  switchOrganization,
  getOrganization,
} from '../organizations/organizationController';
import {
  inviteUser,
  getPendingInvites,
  acceptInvite,
  getOrganizationInvites,
} from '../invites/inviteController';
import { authenticate, requireOrganizationAccess } from '../auth/authMiddleware';
import { canUploadContracts, canReadContracts } from '../auth/roleMiddleware';

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

// ============================================
// AUTH ROUTES (Public)
// ============================================
router.post('/auth/register', register);
router.post('/auth/login', login);

// Get current user (Protected)
router.get('/auth/me', authenticate, getCurrentUser);

// ============================================
// ORGANIZATION ROUTES (Protected)
// ============================================
router.post('/organizations', authenticate, createOrganization);
router.get('/organizations', authenticate, getUserOrganizations);
router.post('/organizations/switch', authenticate, switchOrganization);
router.get('/organizations/:organizationId', authenticate, getOrganization);

// ============================================
// INVITE ROUTES (Protected)
// ============================================
router.post('/invites', authenticate, requireOrganizationAccess, inviteUser);
router.get('/invites/pending', authenticate, getPendingInvites);
router.post('/invites/:inviteId/accept', authenticate, acceptInvite);
router.get('/organizations/:organizationId/invites', authenticate, getOrganizationInvites);

// ============================================
// CONTRACT ROUTES (Protected)
// ============================================

// Get all contracts in organization
router.get(
  '/contracts',
  authenticate,
  requireOrganizationAccess,
  canReadContracts,
  getContracts
);

// Contract upload route (requires upload permission)
router.post(
  '/contracts/upload',
  upload.single('file'),
  handleMulterError,
  authenticate,
  requireOrganizationAccess,
  canUploadContracts,
  uploadContract
);

// Contract verify route (requires upload permission)
router.post(
  '/contracts/verify',
  upload.single('file'),
  handleMulterError,
  authenticate,
  requireOrganizationAccess,
  canUploadContracts,
  verifyContract
);

// Get contract by ID (read access)
router.get(
  '/contracts/:contractId',
  authenticate,
  requireOrganizationAccess,
  canReadContracts,
  getContract
);

// Get all versions of a contract (read access)
router.get(
  '/contracts/:contractId/versions',
  authenticate,
  requireOrganizationAccess,
  canReadContracts,
  getContractVersions
);

// Get specific version by ID (read access)
router.get(
  '/versions/:versionId',
  authenticate,
  requireOrganizationAccess,
  canReadContracts,
  getVersion
);

// Get canonical text for a version (read access)
router.get(
  '/versions/:versionId/canonical',
  authenticate,
  requireOrganizationAccess,
  canReadContracts,
  getCanonicalText
);

// Trigger AI analysis for a version (all roles can trigger)
router.post(
  '/versions/:versionId/analyze',
  authenticate,
  requireOrganizationAccess,
  analyzeContract
);

// Get AI analysis results for a version (all roles can view)
router.get(
  '/versions/:versionId/analysis',
  authenticate,
  requireOrganizationAccess,
  getAnalysis
);

export default router;
