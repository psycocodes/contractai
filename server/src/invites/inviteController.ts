import { Response } from 'express';
import { asyncHandler, AppError } from '../utils';
import { Invite, User, InviteStatus, Role } from '../db/models';
import { AuthRequest } from '../auth/authMiddleware';
import mongoose from 'mongoose';

/**
 * Invite a user to an organization
 * POST /invites
 */
export const inviteUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, role } = req.body;

  if (!email || !role) {
    throw new AppError('Email and role are required', 400);
  }

  if (!Object.values(Role).includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  if (!req.user || !req.activeOrganizationId) {
    throw new AppError('Authentication required', 401);
  }

  const organizationId = req.activeOrganizationId;

  // Check if there's already a pending invite
  const existingInvite = await Invite.findOne({
    organizationId,
    email: email.toLowerCase(),
    status: InviteStatus.PENDING,
  });

  if (existingInvite) {
    throw new AppError('Pending invite already exists for this email', 400);
  }

  // Check if user is already a member
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const isMember = existingUser.organizations.some(
      (org) => org.organizationId.toString() === organizationId
    );
    if (isMember) {
      throw new AppError('User is already a member of this organization', 400);
    }
  }

  // Create invite
  const invite = new Invite({
    organizationId,
    email: email.toLowerCase(),
    role,
    status: InviteStatus.PENDING,
  });

  await invite.save();

  res.status(201).json({
    success: true,
    data: {
      id: invite._id,
      organizationId: invite.organizationId,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt,
    },
  });
});

/**
 * Get pending invites for current user
 * GET /invites/pending
 */
export const getPendingInvites = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const invites = await Invite.find({
      email: req.user.email,
      status: InviteStatus.PENDING,
    }).populate('organizationId', 'name');

    res.status(200).json({
      success: true,
      data: invites,
    });
  }
);

/**
 * Accept an invite
 * POST /invites/:inviteId/accept
 */
export const acceptInvite = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { inviteId } = req.params;

  if (!req.user || !req.userId) {
    throw new AppError('Authentication required', 401);
  }

  const invite = await Invite.findById(inviteId);

  if (!invite) {
    throw new AppError('Invite not found', 404);
  }

  if (invite.email !== req.user.email) {
    throw new AppError('This invite is not for you', 403);
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new AppError('Invite has already been processed', 400);
  }

  // Check if user is already a member
  const isMember = req.user.organizations.some(
    (org) => org.organizationId.toString() === invite.organizationId.toString()
  );

  if (isMember) {
    throw new AppError('You are already a member of this organization', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add user to organization
    req.user.organizations.push({
      organizationId: invite.organizationId,
      role: invite.role,
    });
    await req.user.save({ session });

    // Update invite status
    invite.status = InviteStatus.ACCEPTED;
    await invite.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        message: 'Invite accepted successfully',
        organizationId: invite.organizationId,
        role: invite.role,
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
 * Get all invites for an organization (organization members only)
 * GET /organizations/:organizationId/invites
 */
export const getOrganizationInvites = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { organizationId } = req.params;

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Check if user is a member of the organization
    const isMember = req.user.organizations.some(
      (org) => org.organizationId.toString() === organizationId
    );

    if (!isMember) {
      throw new AppError('You are not a member of this organization', 403);
    }

    const invites = await Invite.find({ organizationId });

    res.status(200).json({
      success: true,
      data: invites,
    });
  }
);
