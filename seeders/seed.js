const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific .env file FIRST
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Trip = require('../models/Trip');

// Get MongoDB URI and validate it exists
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined!');
  console.error('Make sure .env.production file exists with MONGODB_URI');
  process.exit(1);
}

// Connect to database BEFORE seeding
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    return seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Real NTC routes data (from your GPS simulator)
const routesData = [
  {
    routeNumber: 'ROUTE_001',
    name: 'Colombo - Kandy',
    origin: 'Colombo Fort',
    destination: 'Kandy Central',
    distance: 115,
    estimatedDuration: 210, // minutes
    waypoints: [
      { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
      { name: 'Pettah', latitude: 6.9319, longitude: 79.8478, stopDuration: 120, sequenceNumber: 2 },
      { name: 'Kelaniya', latitude: 7.0378, longitude: 79.9003, stopDuration: 60, sequenceNumber: 3 },
      { name: 'Kiribathgoda', latitude: 7.0873, longitude: 79.9553, stopDuration: 180, sequenceNumber: 4 },
      { name: 'Kadawatha', latitude: 7.1431, longitude: 79.9969, stopDuration: 120, sequenceNumber: 5 },
      { name: 'Nittambuwa', latitude: 7.1906, longitude: 80.1003, stopDuration: 300, sequenceNumber: 6 },
      { name: 'Warakapola', latitude: 7.2336, longitude: 80.1956, stopDuration: 240, sequenceNumber: 7 },
      { name: 'Kegalle', latitude: 7.2503, longitude: 80.3464, stopDuration: 420, sequenceNumber: 8 },
      { name: 'Kadugannawa', latitude: 7.3311, longitude: 80.5978, stopDuration: 180, sequenceNumber: 9 },
      { name: 'Kandy Central', latitude: 7.2906, longitude: 80.6337, stopDuration: 600, sequenceNumber: 10 }
    ]
  },
  {
    routeNumber: 'ROUTE_002',
    name: 'Colombo - Galle',
    origin: 'Colombo Fort',
    destination: 'Galle Fort',
    distance: 119,
    estimatedDuration: 180,
    waypoints: [
      { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
      { name: 'Wellawatte', latitude: 6.8485, longitude: 79.8848, stopDuration: 120, sequenceNumber: 2 },
      { name: 'Moratuwa', latitude: 6.7648, longitude: 79.9014, stopDuration: 180, sequenceNumber: 3 },
      { name: 'Panadura', latitude: 6.7133, longitude: 79.9206, stopDuration: 240, sequenceNumber: 4 },
      { name: 'Kalutara', latitude: 6.6186, longitude: 79.9883, stopDuration: 300, sequenceNumber: 5 },
      { name: 'Beruwala', latitude: 6.4218, longitude: 80.0180, stopDuration: 180, sequenceNumber: 6 },
      { name: 'Bentota', latitude: 6.3676, longitude: 80.0142, stopDuration: 120, sequenceNumber: 7 },
      { name: 'Ambalangoda', latitude: 6.2390, longitude: 80.0503, stopDuration: 240, sequenceNumber: 8 },
      { name: 'Hikkaduwa', latitude: 6.1408, longitude: 80.0990, stopDuration: 180, sequenceNumber: 9 },
      { name: 'Galle Fort', latitude: 6.0535, longitude: 80.2210, stopDuration: 600, sequenceNumber: 10 }
    ]
  },
  {
    routeNumber: 'ROUTE_003',
    name: 'Colombo - Ratnapura',
    origin: 'Colombo Fort',
    destination: 'Ratnapura',
    distance: 101,
    estimatedDuration: 150,
    waypoints: [
      { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
      { name: 'Nugegoda', latitude: 6.8560, longitude: 79.9208, stopDuration: 120, sequenceNumber: 2 },
      { name: 'Hanwella', latitude: 6.8211, longitude: 80.0377, stopDuration: 180, sequenceNumber: 3 },
      { name: 'Avissawella', latitude: 6.7354, longitude: 80.1495, stopDuration: 240, sequenceNumber: 4 },
      { name: 'Eheliyagoda', latitude: 6.6892, longitude: 80.2372, stopDuration: 180, sequenceNumber: 5 },
      { name: 'Kuruwita', latitude: 6.6659, longitude: 80.3729, stopDuration: 120, sequenceNumber: 6 },
      { name: 'Ratnapura', latitude: 6.6835, longitude: 80.3992, stopDuration: 600, sequenceNumber: 7 }
    ]
  },
  {
    routeNumber: 'ROUTE_004',
    name: 'Colombo - Anuradhapura',
    origin: 'Colombo Fort',
    destination: 'Anuradhapura',
    distance: 206,
    estimatedDuration: 270,
    waypoints: [
      { name: 'Colombo Fort', latitude: 6.9271, longitude: 79.8612, stopDuration: 300, sequenceNumber: 1 },
      { name: 'Negombo', latitude: 7.1067, longitude: 79.8392, stopDuration: 240, sequenceNumber: 2 },
      { name: 'Chilaw', latitude: 7.2167, longitude: 79.8500, stopDuration: 300, sequenceNumber: 3 },
      { name: 'Puttalam', latitude: 8.0362, longitude: 80.0851, stopDuration: 360, sequenceNumber: 4 },
      { name: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037, stopDuration: 600, sequenceNumber: 5 }
    ]
  },
  {
    routeNumber: 'ROUTE_005',
    name: 'Kandy - Badulla',
    origin: 'Kandy Central',
    destination: 'Badulla',
    distance: 142,
    estimatedDuration: 240,
    waypoints: [
      { name: 'Kandy Central', latitude: 7.2906, longitude: 80.6337, stopDuration: 300, sequenceNumber: 1 },
      { name: 'Peradeniya', latitude: 7.2683, longitude: 80.5908, stopDuration: 120, sequenceNumber: 2 },
      { name: 'Gampola', latitude: 7.2571, longitude: 80.5821, stopDuration: 180, sequenceNumber: 3 },
      { name: 'Nuwara Eliya', latitude: 7.0378, longitude: 80.7675, stopDuration: 420, sequenceNumber: 4 },
      { name: 'Ella', latitude: 6.9895, longitude: 81.0550, stopDuration: 240, sequenceNumber: 5 },
      { name: 'Badulla', latitude: 6.9934, longitude: 81.0550, stopDuration: 600, sequenceNumber: 6 }
    ]
  }
];

// 25 buses (5 per route)
const busesData = [
  // Route 001: Colombo-Kandy (5 buses)
  { busNumber: 'NB-1001', registrationNumber: 'WP-CAB-1001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-1002', registrationNumber: 'WP-CAB-1002', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 50, standing: 15 } },
  { busNumber: 'NB-1003', registrationNumber: 'WP-CAB-1003', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 } },
  { busNumber: 'NB-1004', registrationNumber: 'WP-CAB-1004', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-1005', registrationNumber: 'WP-CAB-1005', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 48, standing: 10 } },
  
  // Route 002: Colombo-Galle (5 buses)
  { busNumber: 'NB-2001', registrationNumber: 'WP-CAC-2001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-2002', registrationNumber: 'WP-CAC-2002', operator: 'Private', serviceType: 'AC', capacity: { seated: 42, standing: 0 } },
  { busNumber: 'NB-2003', registrationNumber: 'WP-CAC-2003', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 50, standing: 15 } },
  { busNumber: 'NB-2004', registrationNumber: 'WP-CAC-2004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 44, standing: 18 } },
  { busNumber: 'NB-2005', registrationNumber: 'WP-CAC-2005', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 } },
  
  // Route 003: Colombo-Ratnapura (5 buses)
  { busNumber: 'NB-3001', registrationNumber: 'WP-CAD-3001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-3002', registrationNumber: 'WP-CAD-3002', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 48, standing: 12 } },
  { busNumber: 'NB-3003', registrationNumber: 'WP-CAD-3003', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-3004', registrationNumber: 'WP-CAD-3004', operator: 'Private', serviceType: 'AC', capacity: { seated: 40, standing: 0 } },
  { busNumber: 'NB-3005', registrationNumber: 'WP-CAD-3005', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 50, standing: 15 } },
  
  // Route 004: Colombo-Anuradhapura (5 buses)
  { busNumber: 'NB-4001', registrationNumber: 'WP-CAE-4001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-4002', registrationNumber: 'WP-CAE-4002', operator: 'Private', serviceType: 'AC', capacity: { seated: 42, standing: 0 } },
  { busNumber: 'NB-4003', registrationNumber: 'WP-CAE-4003', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 50, standing: 15 } },
  { busNumber: 'NB-4004', registrationNumber: 'WP-CAE-4004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 44, standing: 18 } },
  { busNumber: 'NB-4005', registrationNumber: 'WP-CAE-4005', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 } },
  
  // Route 005: Kandy-Badulla (5 buses)
  { busNumber: 'NB-5001', registrationNumber: 'CP-CAF-5001', operator: 'SLTB', serviceType: 'Normal', capacity: { seated: 45, standing: 20 } },
  { busNumber: 'NB-5002', registrationNumber: 'CP-CAF-5002', operator: 'Private', serviceType: 'Semi-Luxury', capacity: { seated: 48, standing: 12 } },
  { busNumber: 'NB-5003', registrationNumber: 'CP-CAF-5003', operator: 'SLTB', serviceType: 'AC', capacity: { seated: 40, standing: 0 } },
  { busNumber: 'NB-5004', registrationNumber: 'CP-CAF-5004', operator: 'Private', serviceType: 'Normal', capacity: { seated: 44, standing: 18 } },
  { busNumber: 'NB-5005', registrationNumber: 'CP-CAF-5005', operator: 'SLTB', serviceType: 'Semi-Luxury', capacity: { seated: 50, standing: 15 } }
];

// Function to generate trips for 1 week
function generateTrips(buses, routes) {
  const trips = [];
  let tripCounter = 1;
  
  // Start date (today)
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Generate trips for 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // For each route
    routes.forEach((route, routeIndex) => {
      // Get buses for this route (5 buses per route)
      const routeBuses = buses.slice(routeIndex * 5, (routeIndex * 5) + 5);
      
      // Generate 4 trips per day per route (2 outbound, 2 inbound)
      // Morning outbound - 6:00 AM and 8:00 AM
      routeBuses.slice(0, 2).forEach((bus, busIndex) => {
        const departureTime = new Date(currentDate);
        departureTime.setHours(6 + (busIndex * 2), 0, 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + route.estimatedDuration);
        
        trips.push({
          tripNumber: `TRIP-${String(tripCounter).padStart(5, '0')}`,
          bus: bus._id,
          route: route._id,
          direction: 'outbound',
          departureTime,
          arrivalTime,
          status: departureTime < new Date() ? 'completed' : 'scheduled'
        });
        tripCounter++;
      });
      
      // Afternoon inbound - 2:00 PM and 4:00 PM
      routeBuses.slice(2, 4).forEach((bus, busIndex) => {
        const departureTime = new Date(currentDate);
        departureTime.setHours(14 + (busIndex * 2), 0, 0, 0);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + route.estimatedDuration);
        
        trips.push({
          tripNumber: `TRIP-${String(tripCounter).padStart(5, '0')}`,
          bus: bus._id,
          route: route._id,
          direction: 'inbound',
          departureTime,
          arrivalTime,
          status: departureTime < new Date() ? 'completed' : 'scheduled'
        });
        tripCounter++;
      });
    });
  }
  
  // Mark some trips as in_progress (trips that should be running now)
  const now = new Date();
  trips.forEach(trip => {
    if (trip.departureTime <= now && trip.arrivalTime >= now) {
      trip.status = 'in_progress';
    }
  });
  
  return trips;
}

// Main seed function
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Admin.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Trip.deleteMany({});
    
    // Create admin user
    console.log('Creating admin user...');
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123'
    });
    console.log('Admin created: username=admin, password=admin123');
    
    // Create routes
    console.log('Creating routes...');
    const routes = await Route.insertMany(routesData);
    console.log(`${routes.length} routes created`);
    
    // Create buses
    console.log('Creating buses...');
    const buses = await Bus.insertMany(busesData);
    console.log(`${buses.length} buses created`);
    
    // Generate and create trips
    console.log('Generating trip schedules...');
    const tripsData = generateTrips(buses, routes);
    const trips = await Trip.insertMany(tripsData);
    console.log(`${trips.length} trips created for 7 days`);
    
    // Summary
    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log(`Admin: 1`);
    console.log(`Routes: ${routes.length}`);
    console.log(`Buses: ${buses.length}`);
    console.log(`Trips: ${trips.length}`);
    console.log('========================================');
    
    console.log('Bus ID Mapping for GPS Simulator:');
    console.log('========================================');
    buses.forEach(bus => {
      console.log(`'${bus.busNumber}': '${bus._id}',`);
    });
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();