import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { User, IUser } from '../db/models';
import mongoose from 'mongoose';

// JWT secret - should be from env in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  activeOrganizationId: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  activeOrganizationId?: string;
}

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

/**
 * Authentication middleware
 * Protects routes by requiring valid JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.userId = decoded.userId;
    req.activeOrganizationId = decoded.activeOrganizationId;

    // Optionally fetch and attach full user object
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify user has access to the organization
 */
export const requireOrganizationAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user || !req.activeOrganizationId) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user belongs to the active organization
    const isMember = req.user.organizations.some(
      (org) => org.organizationId.toString() === req.activeOrganizationId
    );

    if (!isMember) {
      throw new AppError('Access denied to this organization', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
