import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
