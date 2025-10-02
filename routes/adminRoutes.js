const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllBuses,
  getBus,
  createBus,
  updateBus,
  deleteBus,
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
  getAllTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  createLocation
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', getDashboard);

// Buses routes
router.route('/buses')
  .get(getAllBuses)
  .post(createBus);

router.route('/buses/:id')
  .get(getBus)
  .put(updateBus)
  .delete(deleteBus);

// Routes routes
router.route('/routes')
  .get(getAllRoutes)
  .post(createRoute);

router.route('/routes/:id')
  .get(getRoute)
  .put(updateRoute)
  .delete(deleteRoute);

// Trips routes
router.route('/trips')
  .get(getAllTrips)
  .post(createTrip);

router.route('/trips/:id')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

// Locations (GPS simulator posts here)
router.post('/locations', createLocation);

module.exports = router;