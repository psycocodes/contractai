import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  name: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    name: {
      type: String,
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for organization-scoped queries
ContractSchema.index({ organizationId: 1 });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
