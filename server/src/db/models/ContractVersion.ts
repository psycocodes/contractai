import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContractVersion extends Document {
  contractId: Types.ObjectId;
  versionNumber: number;
  fileName: string;
  fileType: string;
  rawText: string;
  canonicalContent: string;
  contractHash: string;
  normalizationVersion: string;
  hashAlgorithm: string;
  onChainTxHash?: string;
  uploadedAt: Date;
}

const ContractVersionSchema = new Schema<IContractVersion>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'txt'],
    },
    contractHash: {
      type: String,
      required: true,
    },
    normalizationVersion: {
      type: String,
      default: '1.0',
    },
    hashAlgorithm: {
      type: String,
      default: 'SHA-256',
    },
    rawText: {
      type: String,
      required: true,
    },
    canonicalContent: {
      type: String,
      required: true,
    },
    onChainTxHash: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index to ensure unique version numbers per contract
ContractVersionSchema.index({ contractId: 1, versionNumber: 1 }, { unique: true });

export const ContractVersion = mongoose.model<IContractVersion>('ContractVersion', ContractVersionSchema);
