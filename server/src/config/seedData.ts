import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { ComplaintModel } from '../models/Complaint.js';

export async function seedDatabase() {
  try {
    const userCount = await UserModel.countDocuments();
    let citizenUser = await UserModel.findOne({ email: 'citizen@smartcity.gov.in' });
    let officerUser = await UserModel.findOne({ email: 'officer@smartcity.gov.in' });

    if (userCount === 0 || !citizenUser) {
      console.log('🌱 Seeding demo users into MongoDB...');
      const defaultPasswordHash = await bcrypt.hash('Password@123', 12);

      const users = await UserModel.create([
        {
          name: 'Aarav Sharma',
          email: 'citizen@smartcity.gov.in',
          phone: '+91 98765 43210',
          role: 'Citizen',
          passwordHash: defaultPasswordHash,
          language: 'English',
        },
        {
          name: 'D. Kulkarni',
          email: 'officer@smartcity.gov.in',
          phone: '+91 98765 43211',
          role: 'Government Officer',
          passwordHash: defaultPasswordHash,
          language: 'English',
        },
        {
          name: 'Rajesh Verma',
          email: 'depthead@smartcity.gov.in',
          phone: '+91 98765 43212',
          role: 'Department Head',
          passwordHash: defaultPasswordHash,
          language: 'English',
        },
        {
          name: 'GovTech System Admin',
          email: 'admin@smartcity.gov.in',
          phone: '+91 98765 43213',
          role: 'Admin',
          passwordHash: defaultPasswordHash,
          language: 'English',
        },
      ]);

      citizenUser = users[0] || null;
      officerUser = users[1] || null;
      console.log('✅ Demo users seeded successfully.');
    }

    // Purge any legacy sample complaints to keep clean database
    const cleared = await ComplaintModel.deleteMany({});
    if (cleared.deletedCount > 0) {
      console.log(`🧹 Cleared ${cleared.deletedCount} legacy test complaints from MongoDB.`);
    }
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
}
