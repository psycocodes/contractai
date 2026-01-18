import { Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { AuthRequest } from './authMiddleware';
import { Role } from '../db/models';

/**
 * Get user's role in the active organization
 */
const getUserRole = (req: AuthRequest): Role | null => {
  if (!req.user || !req.activeOrganizationId) {
    return null;
  }

  const membership = req.user.organizations.find(
    (org) => org.organizationId.toString() === req.activeOrganizationId
  );

  return membership ? membership.role : null;
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = getUserRole(req);

      if (!userRole) {
        throw new AppError('User role not found in organization', 403);
      }

      if (!allowedRoles.includes(userRole)) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can upload contracts
 * Only CREATOR and APPROVER can upload
 */
export const canUploadContracts = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userRole = getUserRole(req);

    if (!userRole) {
      throw new AppError('User role not found in organization', 403);
    }

    if (userRole !== Role.CREATOR && userRole !== Role.APPROVER) {
      throw new AppError('Only CREATOR and APPROVER can upload contracts', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has read access to contracts
 * All roles have read access
 */
export const canReadContracts = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // All authenticated organization members can read contracts
  next();
};
