import { Response } from 'express';
import { asyncHandler, AppError } from '../utils';
import { Organization, User, Role } from '../db/models';
import { AuthRequest, generateToken } from '../auth/authMiddleware';
import mongoose from 'mongoose';

/**
 * Create a new organization
 * POST /organizations
 */
export const createOrganization = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name } = req.body;

    if (!name) {
      throw new AppError('Organization name is required', 400);
    }

    if (!req.user || !req.userId) {
      throw new AppError('Authentication required', 401);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create organization
      const organization = new Organization({
        name,
        createdBy: req.userId,
      });
      await organization.save({ session });

      // Add creator to organization
      req.user.organizations.push({
        organizationId: organization._id as mongoose.Types.ObjectId,
        role: Role.CREATOR,
      });
      await req.user.save({ session });

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        data: {
          id: organization._id,
          name: organization.name,
          createdBy: organization.createdBy,
          createdAt: organization.createdAt,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

/**
 * Get all organizations user belongs to
 * GET /organizations
 */
export const getUserOrganizations = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Get organization IDs from user
    const orgIds = req.user.organizations.map((org) => org.organizationId);

    // Fetch full organization details
    const organizations = await Organization.find({
      _id: { $in: orgIds },
    });

    // Map organizations with user's role
    const organizationsWithRole = organizations.map((org) => {
      const membership = req.user!.organizations.find(
        (m) => m.organizationId.toString() === org._id.toString()
      );

      return {
        id: org._id,
        name: org.name,
        createdBy: org.createdBy,
        createdAt: org.createdAt,
        role: membership?.role,
      };
    });

    res.status(200).json({
      success: true,
      data: organizationsWithRole,
    });
  }
);

/**
 * Switch active organization
 * POST /organizations/switch
 */
export const switchOrganization = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { organizationId } = req.body;

    if (!organizationId) {
      throw new AppError('Organization ID is required', 400);
    }

    if (!req.user || !req.userId) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user belongs to the organization
    const isMember = req.user.organizations.some(
      (org) => org.organizationId.toString() === organizationId
    );

    if (!isMember) {
      throw new AppError('You are not a member of this organization', 403);
    }

    // Generate new token with updated active organization
    const token = generateToken({
      userId: req.userId,
      activeOrganizationId: organizationId,
    });

    res.status(200).json({
      success: true,
      data: {
        activeOrganizationId: organizationId,
        token,
      },
    });
  }
);

/**
 * Get organization details
 * GET /organizations/:organizationId
 */
export const getOrganization = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { organizationId } = req.params;

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user belongs to the organization
    const isMember = req.user.organizations.some(
      (org) => org.organizationId.toString() === organizationId
    );

    if (!isMember) {
      throw new AppError('You are not a member of this organization', 403);
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    // Get user's role in this organization
    const membership = req.user.organizations.find(
      (org) => org.organizationId.toString() === organizationId
    );

    res.status(200).json({
      success: true,
      data: {
        id: organization._id,
        name: organization.name,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
        userRole: membership?.role,
      },
    });
  }
);
