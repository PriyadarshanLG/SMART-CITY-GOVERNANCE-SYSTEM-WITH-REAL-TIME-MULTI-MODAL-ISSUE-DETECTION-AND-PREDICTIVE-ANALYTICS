import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const complaintTimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const complaintSchema = new Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    citizenName: { type: String, trim: true },
    citizenPhone: { type: String, trim: true },
    citizenEmail: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      address: { type: String, trim: true },
      ward: { type: String, trim: true },
      city: { type: String, trim: true, default: 'Smart City' },
      area: { type: String, trim: true },
      landmark: { type: String, trim: true },
    },
    category: { type: String, required: true },
    department: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium', required: true },
    status: {
      type: String,
      enum: [
        'Submitted',
        'ML Classified',
        'Department Assigned',
        'Officer Assigned',
        'Work Started',
        'Work In Progress',
        'Pending',
        'Completed',
        'Resolved',
        'Citizen Verified',
        'Rejected',
      ],
      default: 'Submitted',
    },
    assignedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedOfficerName: { type: String },
    supportCount: { type: Number, default: 0 },
    timeline: { type: [complaintTimelineSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    resolutionNotes: { type: String },
  },
  { timestamps: true },
);

export type ComplaintDocument = InferSchemaType<typeof complaintSchema>;
export const ComplaintModel = model('Complaint', complaintSchema);
