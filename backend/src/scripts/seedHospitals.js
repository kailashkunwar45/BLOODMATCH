const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hospital = require('../models/Hospital');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../../.env' });

const nepalBloodBanks = [
  { name: 'Nepal Red Cross Society, Central Blood Transfusion Service', address: 'Exhibition Road', city: 'Kathmandu', contact: '01-4225067', coordinates: [85.3183, 27.7027] },
  { name: 'Nepal Red Cross Society, Bhaktapur', address: 'Dudhpati', city: 'Bhaktapur', contact: '01-6611496', coordinates: [85.4278, 27.6722] },
  { name: 'Nepal Red Cross Society, Lalitpur', address: 'Pulchowk', city: 'Lalitpur', contact: '01-5522595', coordinates: [85.3150, 27.6775] },
  { name: 'Nepal Red Cross Society, Kaski', address: 'Prithvi Chowk', city: 'Pokhara', contact: '061-525032', coordinates: [83.9875, 28.2096] },
  { name: 'Nepal Red Cross Society, Chitwan', address: 'Bharatpur Heights', city: 'Bharatpur', contact: '056-523178', coordinates: [84.4363, 27.6833] },
  { name: 'Nepal Red Cross Society, Morang', address: 'Hospital Road', city: 'Biratnagar', contact: '021-524227', coordinates: [87.2718, 26.4525] },
  { name: 'Nepal Red Cross Society, Rupandehi', address: 'Hospital Line', city: 'Butwal', contact: '071-540306', coordinates: [83.4542, 27.7006] }
];

async function seedBloodBanks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-matcher');
    console.log('✅ MongoDB connected');

    // Create a dummy admin for these blood banks if needed
    let admin = await User.findOne({ email: 'banks_admin@redcross.org.np' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin (Blood Banks)',
        email: 'banks_admin@redcross.org.np',
        password: 'admin_password123',
        role: 'hospital_admin' // Reusing hospital admin for blood banks
      });
      console.log('Created admin for blood banks');
    }

    for (const bank of nepalBloodBanks) {
      const exists = await Hospital.findOne({ contact: bank.contact });
      if (!exists) {
        await Hospital.create({
          admin: admin._id,
          name: bank.name,
          address: bank.address,
          city: bank.city,
          contact: bank.contact,
          location: { type: 'Point', coordinates: bank.coordinates }
        });
        console.log(`Seeded: ${bank.name}`);
      }
    }
    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedBloodBanks();
