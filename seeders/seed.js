require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ntc-bus-tracking')
  .then(seedDatabase)
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });

async function seedDatabase() {
  console.log('\n=== Seeding Database ===\n');

  try {
    // Create Admin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        status: 'active'
    });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin already exists');
    }

    // Create Routes
    const existingRoutes = await Route.countDocuments();
    if (existingRoutes === 0) {
      const routes = [
        {
          routeNumber: 'R001',
          name: 'Colombo - Kandy',
          origin: 'Colombo',
          destination: 'Kandy',
          distance: 115,
          estimatedDuration: 180,
          waypoints: [
            { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
            { name: 'Pettah', latitude: 6.9319, longitude: 79.8478, stopDuration: 120, sequenceNumber: 2 },
            { name: 'Kadawatha', latitude: 7.1431, longitude: 79.9969, stopDuration: 120, sequenceNumber: 3 },
            { name: 'Kegalle', latitude: 7.2503, longitude: 80.3464, stopDuration: 420, sequenceNumber: 4 },
            { name: 'Kandy Central', latitude: 7.2906, longitude: 80.6337, stopDuration: 600, sequenceNumber: 5 }
          ]
        },
        {
          routeNumber: 'R002',
          name: 'Colombo - Galle',
          origin: 'Colombo',
          destination: 'Galle',
          distance: 119,
          estimatedDuration: 150,
          waypoints: [
            { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
            { name: 'Moratuwa', latitude: 6.7648, longitude: 79.9014, stopDuration: 180, sequenceNumber: 2 },
            { name: 'Kalutara', latitude: 6.6186, longitude: 79.9883, stopDuration: 300, sequenceNumber: 3 },
            { name: 'Hikkaduwa', latitude: 6.1408, longitude: 80.099, stopDuration: 180, sequenceNumber: 4 },
            { name: 'Galle Fort', latitude: 6.0535, longitude: 80.2210, stopDuration: 600, sequenceNumber: 5 }
          ]
        },
        {
          routeNumber: 'R003',
          name: 'Colombo - Ratnapura',
          origin: 'Colombo',
          destination: 'Ratnapura',
          distance: 101,
          estimatedDuration: 150,
          waypoints: [
            { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
            { name: 'Nugegoda', latitude: 6.8560, longitude: 79.9208, stopDuration: 120, sequenceNumber: 2 },
            { name: 'Avissawella', latitude: 6.7354, longitude: 80.1495, stopDuration: 240, sequenceNumber: 3 },
            { name: 'Ratnapura', latitude: 6.6835, longitude: 80.3992, stopDuration: 600, sequenceNumber: 4 }
          ]
        }
      ];

      await Route.insertMany(routes);
      console.log(`✓ Created ${routes.length} routes`);
    } else {
      console.log(`✓ ${existingRoutes} routes already exist`);
    }

    // Create Buses
    const existingBuses = await Bus.countDocuments();
    if (existingBuses === 0) {
      const buses = [
        { busNumber: 'NB-1001', registrationNumber: 'WP-CAC-1001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-1002', registrationNumber: 'WP-CAC-1002', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-1003', registrationNumber: 'WP-CAC-1003', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-1004', registrationNumber: 'WP-CAC-1004', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-1005', registrationNumber: 'WP-CAC-1005', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-2001', registrationNumber: 'WP-CAC-2001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-2002', registrationNumber: 'WP-CAC-2002', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-2003', registrationNumber: 'WP-CAC-2003', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-2004', registrationNumber: 'WP-CAC-2004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-2005', registrationNumber: 'WP-CAC-2005', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-3001', registrationNumber: 'WP-CAC-3001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-3002', registrationNumber: 'WP-CAC-3002', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-3003', registrationNumber: 'WP-CAC-3003', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-3004', registrationNumber: 'WP-CAC-3004', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-3005', registrationNumber: 'WP-CAC-3005', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-4001', registrationNumber: 'WP-CAC-4001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-4002', registrationNumber: 'WP-CAC-4002', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-4003', registrationNumber: 'WP-CAC-4003', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-4004', registrationNumber: 'WP-CAC-4004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-4005', registrationNumber: 'WP-CAC-4005', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-5001', registrationNumber: 'WP-CAC-5001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-5002', registrationNumber: 'WP-CAC-5002', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' },
        { busNumber: 'NB-5003', registrationNumber: 'WP-CAC-5003', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 }, status: 'active' },
        { busNumber: 'NB-5004', registrationNumber: 'WP-CAC-5004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 50, standing: 30 }, status: 'active' },
        { busNumber: 'NB-5005', registrationNumber: 'WP-CAC-5005', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 45, standing: 0 }, status: 'active' }
      ];

      await Bus.insertMany(buses);
      console.log(`✓ Created ${buses.length} buses`);
    } else {
      console.log(`✓ ${existingBuses} buses already exist`);
    }

    console.log('\n=== Seeding Complete ===\n');
    console.log('Summary:');
    console.log('- Admin: admin / admin123');
    console.log(`- Routes: ${await Route.countDocuments()}`);
    console.log(`- Buses: ${await Bus.countDocuments()}`);
    console.log('\nNext: Run node create-trips-now.js\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}