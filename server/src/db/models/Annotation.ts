import mongoose, { Schema, Document } from 'mongoose';

export enum AnnotationType {
  CLAUSE = 'CLAUSE',
  RISK = 'RISK',
  NOTE = 'NOTE',
}

export interface IAnnotation extends Document {
  contractVersionId: mongoose.Types.ObjectId;
  startOffset: number;
  endOffset: number;
  type: AnnotationType;
  content: string;
  createdAt: Date;
}

const AnnotationSchema = new Schema<IAnnotation>(
  {
    contractVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'ContractVersion',
      required: true,
      index: true,
    },
    startOffset: {
      type: Number,
      required: true,
      min: 0,
    },
    endOffset: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(AnnotationType),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
AnnotationSchema.index({ contractVersionId: 1, startOffset: 1 });

export const Annotation = mongoose.model<IAnnotation>('Annotation', AnnotationSchema);
