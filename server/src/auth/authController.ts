import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../utils';
import { User, Organization, Role } from '../db/models';
import { hashPassword, comparePassword, generateToken, AuthRequest } from '../auth/authMiddleware';
import mongoose from 'mongoose';

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, organizationName } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      organizations: [],
    });

    await user.save({ session });

    // If organizationName provided, create default organization
    let organization = null;
    if (organizationName) {
      organization = new Organization({
        name: organizationName,
        createdBy: user._id,
      });
      await organization.save({ session });

      // Add user to organization as CREATOR
      user.organizations.push({
        organizationId: organization._id as mongoose.Types.ObjectId,
        role: Role.CREATOR,
      });
      await user.save({ session });
    }

    await session.commitTransaction();

    // Generate token - use empty string for activeOrganizationId if no org
    const token = generateToken({
      userId: user._id.toString(),
      activeOrganizationId: organization ? organization._id.toString() : '',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          organizations: user.organizations,
          activeOrganizationId: organization ? organization._id.toString() : null,
        },
        organization: organization
          ? {
              id: organization._id,
              name: organization.name,
            }
          : null,
        token,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Get active organization (first organization by default, or empty string if none)
  const activeOrganizationId =
    user.organizations.length > 0 ? user.organizations[0].organizationId.toString() : '';

  // Generate token (allow login even without org - user might have pending invites)
  const token = generateToken({
    userId: user._id.toString(),
    activeOrganizationId,
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        organizations: user.organizations,
        activeOrganizationId,
      },
      token,
    },
  });
});

/**
 * Get current user profile
 * GET /auth/me
 */
export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      email: req.user.email,
      organizations: req.user.organizations,
      activeOrganizationId: req.activeOrganizationId,
    },
  });
});
