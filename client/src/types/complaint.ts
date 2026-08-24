export interface ComplaintTimelineItem {
  status: string;
  note: string;
  createdAt?: string | Date;
}

export interface ComplaintLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  address?: string;
  ward?: string;
  city?: string;
  area?: string;
  landmark?: string;
}

export interface ComplaintRecord {
  _id?: string;
  complaintId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  supportCount: number;
  citizenName?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  assignedOfficerName?: string;
  createdAt?: string;
  location?: ComplaintLocation;
  timeline?: ComplaintTimelineItem[];
}