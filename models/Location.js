const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required'],
    index: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    index: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  },
  speed: {
    type: Number,
    required: true,
    min: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
locationSchema.index({ bus: 1, timestamp: -1 });
locationSchema.index({ trip: 1, timestamp: -1 });
locationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);