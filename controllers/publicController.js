const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const Location = require('../models/Location');

// Get all routes
// GET /api/public/routes
exports.getAllRoutes = async (req, res) => {
  try {
    const { from, to, sort, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (from) query.origin = new RegExp(from, 'i');
    if (to) query.destination = new RegExp(to, 'i');

    const skip = (page - 1) * limit;

    const routes = await Route.find(query)
      .select('routeNumber name origin destination distance estimatedDuration waypoints')
      .sort(sort || 'routeNumber')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Route.countDocuments(query);

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
// GET /api/public/routes/:id
exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .select('routeNumber name origin destination distance estimatedDuration waypoints');

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

// Get active trips
// GET /api/public/trips/active
exports.getActiveTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const trips = await Trip.find({ status: 'in_progress' })
      .populate('bus', 'busNumber serviceType operator')
      .populate('route', 'routeNumber name origin destination')
      .sort('-departureTime')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Trip.countDocuments({ status: 'in_progress' });

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

// Get upcoming trips for a route
// GET /api/public/trips/upcoming/:routeId
exports.getUpcomingTrips = async (req, res) => {
  try {
    const now = new Date();
    const trips = await Trip.find({
      route: req.params.routeId,
      status: 'scheduled',
      departureTime: { $gte: now }
    })
      .populate('bus', 'busNumber serviceType operator')
      .populate('route', 'routeNumber name origin destination')
      .sort('departureTime')
      .limit(10);

    res.status(200).json({
      status: 'success',
      results: trips.length,
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
// GET /api/public/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('bus', 'busNumber serviceType operator')
      .populate('route', 'routeNumber name origin destination waypoints');

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

// Get latest location for a bus
// GET /api/public/buses/:busId/location
exports.getBusLocation = async (req, res) => {
  try {
    // Find bus first (can search by ID or bus number)
    let bus;
    if (req.params.busId.match(/^[0-9a-fA-F]{24}$/)) {
      bus = await Bus.findById(req.params.busId);
    } else {
      bus = await Bus.findOne({ busNumber: req.params.busId.toUpperCase() });
    }

    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    // Get latest location
    const location = await Location.findOne({ bus: bus._id })
      .sort({ timestamp: -1 })
      .populate('trip', 'tripNumber route direction status')
      .populate({
        path: 'trip',
        populate: {
          path: 'route',
          select: 'routeNumber name origin destination'
        }
      });

    if (!location) {
      return res.status(404).json({
        status: 'error',
        message: 'No location data found for this bus'
      });
    }

    // Generate ETag for caching
    const etag = `"${location._id}-${location.timestamp.getTime()}"`;
    res.set('ETag', etag);
    res.set('Last-Modified', location.timestamp.toUTCString());

    // Check if client has current version
    if (req.get('If-None-Match') === etag) {
      return res.status(304).end();
    }

    res.status(200).json({
      status: 'success',
      data: {
        bus: {
          id: bus._id,
          busNumber: bus.busNumber,
          serviceType: bus.serviceType,
          operator: bus.operator
        },
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          timestamp: location.timestamp
        },
        currentTrip: location.trip ? {
          tripNumber: location.trip.tripNumber,
          route: location.trip.route,
          direction: location.trip.direction,
          status: location.trip.status
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get location history for a bus
// GET /api/public/buses/:busId/location/history
exports.getBusLocationHistory = async (req, res) => {
  try {
    const { limit = 50, startTime, endTime } = req.query;

    // Find bus
    let bus;
    if (req.params.busId.match(/^[0-9a-fA-F]{24}$/)) {
      bus = await Bus.findById(req.params.busId);
    } else {
      bus = await Bus.findOne({ busNumber: req.params.busId.toUpperCase() });
    }

    if (!bus) {
      return res.status(404).json({
        status: 'error',
        message: 'Bus not found'
      });
    }

    // Build query
    const query = { bus: bus._id };
    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = new Date(startTime);
      if (endTime) query.timestamp.$lte = new Date(endTime);
    }

    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('latitude longitude speed heading timestamp');

    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: {
        busNumber: bus.busNumber,
        locations
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get buses nearby a location
// GET /api/public/buses/nearby
exports.getBusesNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide latitude and longitude'
      });
    }

    // Get all active buses
    const activeBuses = await Bus.find({ status: 'active' }).select('_id');
    const busIds = activeBuses.map(bus => bus._id);

    // Get latest location for each bus
    const locations = await Location.aggregate([
      {
        $match: {
          bus: { $in: busIds }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$bus',
          latestLocation: { $first: '$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestLocation' }
      }
    ]);

    // Filter by distance
    const lat1 = parseFloat(latitude);
    const lon1 = parseFloat(longitude);
    const radiusKm = parseFloat(radius) / 1000;

    const nearbyBuses = locations.filter(loc => {
      const lat2 = loc.latitude;
      const lon2 = loc.longitude;
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      return distance <= radiusKm;
    });

    // Populate bus details
    await Location.populate(nearbyBuses, {
      path: 'bus',
      select: 'busNumber serviceType operator'
    });

    await Location.populate(nearbyBuses, {
      path: 'trip',
      select: 'tripNumber route direction',
      populate: {
        path: 'route',
        select: 'routeNumber name origin destination'
      }
    });

    res.status(200).json({
      status: 'success',
      results: nearbyBuses.length,
      data: {
        buses: nearbyBuses
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all active bus locations
// GET /api/public/locations/active
exports.getActiveLocations = async (req, res) => {
  try {
    // Get all active trips
    const activeTrips = await Trip.find({ status: 'in_progress' })
      .populate('bus', 'busNumber serviceType operator')
      .populate('route', 'routeNumber name origin destination');

    if (!activeTrips || activeTrips.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: {
          locations: []
        }
      });
    }

    const busIds = activeTrips.map(trip => trip.bus._id);

    // Get latest location for each active bus
    const locations = await Location.aggregate([
      {
        $match: {
          bus: { $in: busIds },
          timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$bus',
          latestLocation: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestLocation' }
      }
    ]);

    // Populate bus and trip details
    const populatedLocations = await Location.populate(locations, [
      {
        path: 'bus',
        select: 'busNumber serviceType operator registrationNumber'
      },
      {
        path: 'trip',
        select: 'tripNumber route direction status',
        populate: {
          path: 'route',
          select: 'routeNumber name origin destination'
        }
      }
    ]);

    // Format response to match expected frontend structure
    const formattedLocations = populatedLocations
      .filter(loc => loc.bus && loc.trip) // Only include complete data
      .map(loc => ({
        bus: loc.bus,
        location: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          speed: loc.speed,
          heading: loc.heading,
          timestamp: loc.timestamp
        },
        trip: loc.trip
      }));

    res.status(200).json({
      status: 'success',
      results: formattedLocations.length,
      data: {
        locations: formattedLocations
      }
    });
  } catch (error) {
    console.error('Error in getActiveLocations:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}