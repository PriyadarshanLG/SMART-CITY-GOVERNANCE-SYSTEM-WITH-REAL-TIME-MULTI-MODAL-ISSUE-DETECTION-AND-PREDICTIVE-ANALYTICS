import { Schema, model, type InferSchemaType } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    type: {
      type: String,
      enum: ['Complaint Submitted', 'Department Assigned', 'Officer Assigned', 'Work Started', 'Completed', 'Verification Pending'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model('Notification', notificationSchema);
