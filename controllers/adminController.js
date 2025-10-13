const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const Location = require('../models/Location');

// Get dashboard statistics
// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: 'active' });
    const totalRoutes = await Route.countDocuments();
    const activeTrips = await Trip.countDocuments({ status: 'in_progress' });
    const scheduledTrips = await Trip.countDocuments({ status: 'scheduled' });

    res.status(200).json({
      status: 'success',
      data: {
        totalBuses,
        activeBuses,
        totalRoutes,
        activeTrips,
        scheduledTrips
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// BUSES CRUD

// Get all buses
// GET /api/admin/buses
exports.getAllBuses = async (req, res) => {
  try {
    const { operator, serviceType, status, sort, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (operator) query.operator = operator;
    if (serviceType) query.serviceType = serviceType;
    if (status) query.status = status;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const buses = await Bus.find(query)
      .sort(sort || 'busNumber')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Bus.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: buses.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        buses
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single bus
// GET /api/admin/buses/:id
exports.getBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        bus
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create bus
// POST /api/admin/buses
exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        bus
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update bus
// PUT /api/admin/buses/:id
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        bus
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete bus
// DELETE /api/admin/buses/:id
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ROUTES CRUD

// Get all routes
// GET /api/admin/routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { sort, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const routes = await Route.find()
      .sort(sort || 'routeNumber')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Route.countDocuments();

    res.status(200).json({
      status: 'success',
      results: routes.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        routes
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single route
// GET /api/admin/routes/:id
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        route
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create route
// POST /api/admin/routes
exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        route
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update route
// PUT /api/admin/routes/:id
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        route
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete route
// DELETE /api/admin/routes/:id
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Route deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// TRIPS CRUD

// Get all trips
// GET /api/admin/trips
exports.getAllTrips = async (req, res) => {
  try {
    const { status, sort, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const trips = await Trip.find(query)
      .populate('bus', 'busNumber registrationNumber serviceType')
      .populate('route', 'routeNumber name origin destination')
      .sort(sort || '-departureTime')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: trips.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: {
        trips
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single trip
// GET /api/admin/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('bus')
      .populate('route');

    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create trip
// POST /api/admin/trips
exports.createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update trip
// PUT /api/admin/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete trip
// DELETE /api/admin/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        status: 'error',
        message: 'Trip not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create location
// POST /api/admin/locations
exports.createLocation = async (req, res) => {
  try {
    const { busId, latitude, longitude, speed, heading, timestamp } = req.body;

    // Validate required fields
    if (!busId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: busId, latitude, longitude'
      });
    }

    // Find active trip for this bus
    const activeTrip = await Trip.findOne({
      bus: busId,
      status: 'in_progress'
    });

    if (!activeTrip) {
      return res.status(400).json({
        status: 'error',
        message: `No active trip found for bus ${busId}`
      });
    }

    const locationData = {
      bus: busId,
      trip: activeTrip._id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed: parseFloat(speed) || 0,
      heading: parseFloat(heading) || 0,
      timestamp: timestamp || new Date()
    };

    const location = await Location.create(locationData);

    // Populate bus and trip details for WebSocket
    await location.populate('bus', 'busNumber registrationNumber serviceType operator');
    await location.populate({
      path: 'trip',
      select: 'tripNumber route direction status',
      populate: {
        path: 'route',
        select: 'routeNumber name origin destination'
      }
    });

    // Format for WebSocket broadcast
    const broadcastData = {
      bus: location.bus,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        timestamp: location.timestamp
      },
      trip: location.trip
    };

    // Emit real-time update via WebSocket
    const io = req.app.get('io');
    
    // Broadcast to specific bus subscribers
    io.to(`bus-${location.bus.busNumber}`).emit('location-update', broadcastData);

    // Broadcast to all buses subscribers
    io.to('all-buses').emit('location-update', broadcastData);

    // Broadcast to route subscribers
    if (location.trip && location.trip.route) {
      io.to(`route-${location.trip.route._id}`).emit('location-update', broadcastData);
    }

    res.status(201).json({
      status: 'success',
      data: {
        location: broadcastData
      }
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};