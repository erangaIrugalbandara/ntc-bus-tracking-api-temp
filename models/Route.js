const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  stopDuration: {
    type: Number,
    default: 120
  },
  sequenceNumber: {
    type: Number,
    required: true
  }
}, { _id: false });

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: 0
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 0
  },
  waypoints: [waypointSchema]
}, {
  timestamps: true
});

// Index for faster queries
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ origin: 1, destination: 1 });

module.exports = mongoose.model('Route', routeSchema);