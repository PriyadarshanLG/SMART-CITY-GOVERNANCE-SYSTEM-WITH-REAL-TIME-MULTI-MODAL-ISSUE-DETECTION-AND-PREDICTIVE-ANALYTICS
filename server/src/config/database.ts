import mongoose from 'mongoose';
import { env } from './env.js';
import { seedDatabase } from './seedData.js';
import { ComplaintModel } from '../models/Complaint.js';
import { UserModel } from '../models/User.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    console.log(`Connecting to MongoDB at: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('📦 MongoDB Connected Successfully.');

    // Clean up any legacy obsolete indexes (like trackingId_1)
    try {
      const complaintCollection = mongoose.connection.collection('complaints');
      const indexes = await complaintCollection.indexes();
      for (const idx of indexes) {
        if (idx.name && idx.name !== '_id_' && idx.name !== 'complaintId_1') {
          console.log(`Dropping legacy index: ${idx.name}`);
          await complaintCollection.dropIndex(idx.name).catch(() => {});
        }
      }
      await ComplaintModel.syncIndexes();
      await UserModel.syncIndexes();
    } catch (idxErr) {
      console.warn('Index sync notice:', idxErr);
    }

    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
  }
}
