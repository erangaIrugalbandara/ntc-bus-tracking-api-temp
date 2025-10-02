const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRoute,
  getActiveTrips,
  getUpcomingTrips,
  getTrip,
  getBusLocation,
  getBusLocationHistory,
  getBusesNearby,
  getActiveLocations
} = require('../controllers/publicController');

// Routes
router.get('/routes', getAllRoutes);
router.get('/routes/:id', getRoute);

// Trips
router.get('/trips/active', getActiveTrips);
router.get('/trips/upcoming/:routeId', getUpcomingTrips);
router.get('/trips/:id', getTrip);

// Bus locations
router.get('/buses/:busId/location', getBusLocation);
router.get('/buses/:busId/location/history', getBusLocationHistory);
router.get('/buses/nearby', getBusesNearby);

// All active locations
router.get('/locations/active', getActiveLocations);

module.exports = router;