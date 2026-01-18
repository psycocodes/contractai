import mongoose, { Schema, Document } from 'mongoose';

export enum Role {
  CREATOR = 'CREATOR',
  REVIEWER = 'REVIEWER',
  APPROVER = 'APPROVER',
  AUDITOR = 'AUDITOR',
}

export interface IOrganizationMembership {
  organizationId: mongoose.Types.ObjectId;
  role: Role;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  organizations: IOrganizationMembership[];
  createdAt: Date;
}

const OrganizationMembershipSchema = new Schema<IOrganizationMembership>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    organizations: {
      type: [OrganizationMembershipSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
UserSchema.index({ email: 1 });

// Index for organization membership queries
UserSchema.index({ 'organizations.organizationId': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
