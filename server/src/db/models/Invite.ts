import mongoose, { Schema, Document } from 'mongoose';
import { Role } from './User';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
}

export interface IInvite extends Document {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: Role;
  status: InviteStatus;
  createdAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InviteStatus),
      default: InviteStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate pending invites
InviteSchema.index({ organizationId: 1, email: 1, status: 1 });

export const Invite = mongoose.model<IInvite>('Invite', InviteSchema);
