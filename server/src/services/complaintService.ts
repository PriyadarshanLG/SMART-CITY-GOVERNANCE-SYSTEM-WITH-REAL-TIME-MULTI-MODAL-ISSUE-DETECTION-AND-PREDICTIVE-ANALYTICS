import { ComplaintModel } from '../models/Complaint.js';

export async function generateComplaintId() {
  const currentYear = new Date().getFullYear();
  // Find highest complaintId or generate next sequential
  const latest = await ComplaintModel.findOne({
    complaintId: new RegExp(`^SC-${currentYear}-`),
  })
    .sort({ createdAt: -1 })
    .lean();

  let nextSeq = 1;
  if (latest?.complaintId) {
    const parts = latest.complaintId.split('-');
    const lastNum = parseInt(parts[parts.length - 1] || '0', 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  // Ensure uniqueness
  let candidate = `SC-${currentYear}-${String(nextSeq).padStart(6, '0')}`;
  let exists = await ComplaintModel.exists({ complaintId: candidate });
  while (exists) {
    nextSeq += 1;
    candidate = `SC-${currentYear}-${String(nextSeq).padStart(6, '0')}`;
    exists = await ComplaintModel.exists({ complaintId: candidate });
  }

  return candidate;
}
