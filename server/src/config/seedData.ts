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

    const complaintCount = await ComplaintModel.countDocuments();
    if (complaintCount === 0) {
      console.log('🌱 Seeding initial civic complaints into MongoDB...');

      await ComplaintModel.create([
        {
          complaintId: 'SC-2026-000001',
          citizenId: citizenUser?._id,
          citizenName: 'Aarav Sharma',
          citizenPhone: '+91 98765 43210',
          citizenEmail: 'citizen@smartcity.gov.in',
          title: 'Street light outage near central ward 7 avenue',
          description: 'Multiple street lights are completely dark near the main road after the storm last weekend. This is causing safety concerns for women and elderly returning home in the evening.',
          category: 'Street Light Outage',
          department: 'Electricity Department',
          priority: 'Medium',
          status: 'Work In Progress',
          supportCount: 14,
          location: {
            ward: '01',
            city: 'Smart City',
            area: 'Central Avenue',
            landmark: 'Opposite High School Gate',
            latitude: 12.9716,
            longitude: 77.5946,
          },
          assignedOfficerName: 'D. Kulkarni',
          timeline: [
            { status: 'Submitted', note: 'Secure citizen ticket raised on municipal portal.', createdAt: new Date(Date.now() - 3600 * 48 * 1000) },
            { status: 'ML Classified', note: 'Automated NLP classifier assigned issue to Electricity Department with 95% confidence.', createdAt: new Date(Date.now() - 3600 * 46 * 1000) },
            { status: 'Department Assigned', note: 'Ticket routed to Ward 01 Electricity division.', createdAt: new Date(Date.now() - 3600 * 24 * 1000) },
            { status: 'Officer Assigned', note: 'Assigned to Ward Engineer D. Kulkarni.', createdAt: new Date(Date.now() - 3600 * 12 * 1000) },
            { status: 'Work In Progress', note: 'Pole repair and luminaire replacement underway.', createdAt: new Date(Date.now() - 3600 * 2 * 1000) },
          ],
        },
        {
          complaintId: 'SC-2026-000214',
          citizenId: citizenUser?._id,
          citizenName: 'Pooja Hegde',
          citizenPhone: '+91 98765 11223',
          citizenEmail: 'pooja.hegde@gmail.com',
          title: 'Uncollected garbage mound outside Metro Station Exit B',
          description: 'Large piles of commercial waste and food packaging have accumulated on the sidewalk outside metro station exit B for 4 days. Foul smell and stray dogs are blocking pedestrian access.',
          category: 'Garbage & Waste',
          department: 'Sanitation Department',
          priority: 'High',
          status: 'Pending',
          supportCount: 29,
          location: {
            ward: '04',
            city: 'Smart City',
            area: 'Metro Ward Sector 4',
            landmark: 'Metro Station Exit B',
            latitude: 12.9815,
            longitude: 77.6012,
          },
          timeline: [
            { status: 'Submitted', note: 'Complaint logged via citizen mobile portal.', createdAt: new Date(Date.now() - 3600 * 14 * 1000) },
            { status: 'ML Classified', note: 'Classified under Sanitation Department (Confidence: 94%).', createdAt: new Date(Date.now() - 3600 * 13 * 1000) },
          ],
        },
        {
          complaintId: 'SC-2026-000305',
          citizenId: citizenUser?._id,
          citizenName: 'M. Ramesh Rao',
          citizenPhone: '+91 98450 99887',
          citizenEmail: 'ramesh.rao@live.com',
          title: 'Drinking water pipeline ruptured sidewalk flooding road',
          description: 'Potable water supply line is gushing clean drinking water continuously across 50 meters of the road. Severe water wastage and road erosion occurring.',
          category: 'Water Supply Leakage',
          department: 'Water Supply Department',
          priority: 'High',
          status: 'Pending',
          supportCount: 42,
          location: {
            ward: '01',
            city: 'Smart City',
            area: 'Central Avenue 4th Cross',
            landmark: 'Near Water Tank #3',
            latitude: 12.9698,
            longitude: 77.5892,
          },
          timeline: [
            { status: 'Submitted', note: 'Emergency high priority grievance registered.', createdAt: new Date(Date.now() - 3600 * 8 * 1000) },
            { status: 'ML Classified', note: 'AI classified as High Priority Water Leakage.', createdAt: new Date(Date.now() - 3600 * 8 * 1000) },
          ],
        },
        {
          complaintId: 'SC-2026-000109',
          citizenId: citizenUser?._id,
          citizenName: 'Suresh Patil',
          citizenPhone: '+91 94480 33445',
          citizenEmail: 'suresh.patil@outlook.com',
          title: 'Deep crater pothole near 80 Feet Road junction',
          description: 'Massive pothole approx 6 inches deep opened up after recent showers. Two motorcyclists suffered minor skids this morning.',
          category: 'Road Damage & Potholes',
          department: 'Public Works Department',
          priority: 'Medium',
          status: 'Resolved',
          supportCount: 18,
          isVerified: true,
          location: {
            ward: '02',
            city: 'Smart City',
            area: 'West Sector 80 Feet Road',
            landmark: 'Opposite State Bank Branch',
            latitude: 12.9654,
            longitude: 77.5765,
          },
          assignedOfficerName: 'S. Patil',
          resolutionNotes: 'Asphalt cold mix and bituminous leveling completed and inspected by ward engineer.',
          timeline: [
            { status: 'Submitted', note: 'Road safety issue reported.', createdAt: new Date(Date.now() - 3600 * 72 * 1000) },
            { status: 'Department Assigned', note: 'PWD quick response patch team allocated.', createdAt: new Date(Date.now() - 3600 * 48 * 1000) },
            { status: 'Work In Progress', note: 'Road leveling and tar compaction in progress.', createdAt: new Date(Date.now() - 3600 * 24 * 1000) },
            { status: 'Resolved', note: 'Pothole fully repaired and sealed.', createdAt: new Date(Date.now() - 3600 * 6 * 1000) },
            { status: 'Citizen Verified', note: 'Complainant confirmed issue resolved satisfactorily.', createdAt: new Date(Date.now() - 3600 * 2 * 1000) },
          ],
        },
      ]);
      console.log('✅ Initial civic complaints seeded successfully into MongoDB.');
    }
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
}
