import { Router } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { classifyComplaint } from '../services/mlService.js';
import { generateComplaintId } from '../services/complaintService.js';
import { ComplaintModel } from '../models/Complaint.js';

export const complaintRouter = Router();

// 1. Summary Statistics Aggregation for Dashboard & Homepage
complaintRouter.get('/stats/summary', async (_req, res, next) => {
  try {
    const total = await ComplaintModel.countDocuments();
    const resolved = await ComplaintModel.countDocuments({
      status: { $in: ['Resolved', 'Completed', 'Citizen Verified'] },
    });
    const inProgress = await ComplaintModel.countDocuments({
      status: { $in: ['Work In Progress', 'Work Started', 'Department Assigned', 'Officer Assigned'] },
    });
    const pending = await ComplaintModel.countDocuments({
      status: { $in: ['Pending', 'Submitted', 'ML Classified'] },
    });

    const categoryStats = await ComplaintModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    const wardStats = await ComplaintModel.aggregate([
      { $group: { _id: '$location.ward', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({
      total,
      resolved,
      inProgress,
      pending,
      slaRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      categories: categoryStats.map((c) => ({ name: c._id || 'General', count: c.count })),
      wards: wardStats.map((w) => ({ ward: w._id || '01', count: w.count })),
    });
  } catch (error) {
    next(error);
  }
});

// 2. Query Complaints with Search, Filtering & Pagination
complaintRouter.get('/', async (req, res, next) => {
  try {
    const {
      search,
      status,
      department,
      category,
      ward,
      priority,
      citizenId,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const filter: Record<string, any> = {};

    if (status && status !== 'All') {
      if (status === 'In Progress') {
        filter.status = { $in: ['Work In Progress', 'Work Started', 'Department Assigned', 'Officer Assigned'] };
      } else if (status === 'Resolved') {
        filter.status = { $in: ['Resolved', 'Completed', 'Citizen Verified'] };
      } else if (status === 'Pending') {
        filter.status = { $in: ['Pending', 'Submitted', 'ML Classified'] };
      } else {
        filter.status = status;
      }
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (ward && ward !== 'All') {
      filter['location.ward'] = ward;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (citizenId && isValidObjectId(citizenId)) {
      filter.citizenId = new mongoose.Types.ObjectId(citizenId);
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { complaintId: searchRegex },
        { department: searchRegex },
        { category: searchRegex },
        { citizenName: searchRegex },
        { 'location.area': searchRegex },
        { 'location.landmark': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      ComplaintModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ComplaintModel.countDocuments(filter),
    ]);

    return res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
});

// 3. Get Single Complaint by complaintId (e.g. SC-2026-000001) or MongoDB _id
complaintRouter.get('/:id', async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query: Record<string, any> = {
      $or: [{ complaintId: idParam }],
    };

    if (isValidObjectId(idParam)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(idParam) });
    }

    const complaint = await ComplaintModel.findOne(query).lean();
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({ complaint });
  } catch (error) {
    next(error);
  }
});

// 4. Create New Complaint with NLP Classifier & MongoDB persistence
complaintRouter.post('/', async (req, res, next) => {
  try {
    const complaintId = await generateComplaintId();
    const title = req.body.title || 'Untitled Civic Grievance';
    const description = req.body.description || '';

    // Run ML or fallback keyword classifier
    const classification = await classifyComplaint({
      title,
      description,
    });

    const category = req.body.category && req.body.category !== 'Unclassified'
      ? req.body.category
      : classification.category;

    const department = req.body.department && req.body.department !== 'Awaiting description'
      ? req.body.department
      : classification.department;

    const priority = req.body.priority || classification.priority || 'Medium';

    const citizenId = isValidObjectId(req.body.citizenId) ? req.body.citizenId : undefined;

    const lat = req.body.location?.latitude ?? req.body.latitude;
    const lng = req.body.location?.longitude ?? req.body.longitude;
    const acc = req.body.location?.accuracy ?? req.body.accuracy;
    const addr = req.body.location?.address ?? req.body.address;
    const ward = req.body.location?.ward || req.body.ward || '01';
    const area = req.body.location?.area || req.body.area || 'Central Avenue';
    const landmark = req.body.location?.landmark || req.body.landmark || '';
    const city = req.body.location?.city || req.body.city || 'Smart City';

    const timelineNotes = [
      {
        status: 'Submitted',
        note: `Grievance registered by ${req.body.name || req.body.citizenName || 'citizen'}${lat && lng ? ` with verified GPS coordinates (${Number(lat).toFixed(4)}°, ${Number(lng).toFixed(4)}°)` : ''}.`,
        createdAt: new Date(),
      },
      {
        status: 'Department Assigned',
        note: `Dispatched to ${department} for Ward ${ward} with priority '${priority}'.`,
        createdAt: new Date(),
      },
    ];

    const complaint = await ComplaintModel.create({
      complaintId,
      citizenId,
      citizenName: req.body.name || req.body.citizenName || 'Concerned Citizen',
      citizenPhone: req.body.phone || req.body.citizenPhone,
      citizenEmail: req.body.email || req.body.citizenEmail,
      title,
      description,
      imageUrl: req.body.imageUrl,
      location: {
        ward,
        city,
        area,
        landmark,
        address: addr,
        latitude: lat ? Number(lat) : undefined,
        longitude: lng ? Number(lng) : undefined,
        accuracy: acc ? Number(acc) : undefined,
      },
      category,
      department,
      priority,
      status: 'Department Assigned',
      supportCount: 1,
      timeline: timelineNotes,
    });

    res.status(201).json({
      message: 'Complaint created successfully and saved in MongoDB',
      complaint,
      classification,
    });
  } catch (error) {
    next(error);
  }
});

// 5. Support / Upvote a Complaint
complaintRouter.post('/:id/support', async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const query: Record<string, any> = {
      $or: [{ complaintId: idParam }],
    };

    if (isValidObjectId(idParam)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(idParam) });
    }

    const complaint = await ComplaintModel.findOneAndUpdate(
      query,
      { $inc: { supportCount: 1 } },
      { new: true },
    ).lean();

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({ message: 'Support recorded successfully', complaint });
  } catch (error) {
    next(error);
  }
});

// 6. Update Status & Append Timeline Note (Officer / Admin workflow)
complaintRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const { status, note, assignedOfficerName, resolutionNotes } = req.body as {
      status: string;
      note?: string;
      assignedOfficerName?: string;
      resolutionNotes?: string;
    };

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const query: Record<string, any> = {
      $or: [{ complaintId: idParam }],
    };

    if (isValidObjectId(idParam)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(idParam) });
    }

    const timelineEntry = {
      status,
      note: note || `Status updated to ${status}.`,
      createdAt: new Date(),
    };

    const updateDoc: Record<string, any> = {
      $set: { status },
      $push: { timeline: timelineEntry },
    };

    if (assignedOfficerName) {
      updateDoc.$set.assignedOfficerName = assignedOfficerName;
    }

    if (resolutionNotes) {
      updateDoc.$set.resolutionNotes = resolutionNotes;
    }

    if (status === 'Resolved' || status === 'Completed' || status === 'Citizen Verified') {
      updateDoc.$set.isVerified = true;
    }

    const complaint = await ComplaintModel.findOneAndUpdate(query, updateDoc, { new: true }).lean();

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    return res.json({ message: 'Status updated successfully', complaint });
  } catch (error) {
    next(error);
  }
});
