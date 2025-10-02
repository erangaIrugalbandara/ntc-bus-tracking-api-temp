require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Trip = require('./models/Trip');

mongoose.connect(process.env.MONGODB_URI)
  .then(createTrips)
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });

async function createTrips() {
  console.log('\n🔧 Creating trips for all buses...\n');

  try {
    // Get all active buses and routes
    const buses = await Bus.find({ status: 'active' }).sort('busNumber');
    const routes = await Route.find().sort('routeNumber');

    console.log(`Found ${buses.length} buses and ${routes.length} routes\n`);

    // Delete old in_progress trips
    const deleted = await Trip.deleteMany({ status: 'in_progress' });
    console.log(`✓ Deleted ${deleted.deletedCount} old trips\n`);

    // Create new trips - distribute buses across routes
    let created = 0;
    for (let i = 0; i < buses.length; i++) {
      const bus = buses[i];
      const route = routes[i % routes.length];

      await Trip.create({
        tripNumber: `TRIP-${bus.busNumber}-${Date.now()}-${i}`,
        bus: bus._id,
        route: route._id,
        direction: 'outbound',
        departureTime: new Date(),
        arrivalTime: new Date(Date.now() + 4 * 3600000),
        status: 'in_progress'
      });

      console.log(`✓ ${bus.busNumber} → ${route.name}`);
      created++;
    }

    console.log(`\n✅ SUCCESS! Created ${created} trips\n`);
    console.log('Next steps:');
    console.log('1. Restart GPS simulator');
    console.log('2. Refresh browser');
    console.log('3. Select a route and see buses!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}