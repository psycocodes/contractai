import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClause {
  title: string;
  text: string;
}

export interface IRiskFlag {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface IAIAnalysis extends Document {
  contractVersionId: Types.ObjectId;
  summary: string;
  clauses: IClause[];
  riskFlags: IRiskFlag[];
  modelName: string;
  modelVersion: string;
  analyzedAt: Date;
}

const ClauseSchema = new Schema<IClause>(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const RiskFlagSchema = new Schema<IRiskFlag>(
  {
    category: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    contractVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractVersion',
      required: true,
      unique: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    clauses: {
      type: [ClauseSchema],
      required: true,
      default: [],
    },
    riskFlags: {
      type: [RiskFlagSchema],
      required: true,
      default: [],
    },
    modelName: {
      type: String,
      required: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
