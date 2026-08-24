import { Schema, model, type InferSchemaType } from 'mongoose';

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    officeAddress: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type DepartmentDocument = InferSchemaType<typeof departmentSchema>;
export const DepartmentModel = model('Department', departmentSchema);
