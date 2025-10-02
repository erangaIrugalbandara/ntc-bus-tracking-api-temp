const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  operator: {
    type: String,
    required: [true, 'Operator is required'],
    enum: ['SLTB', 'Private']
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: ['Normal', 'Semi-Luxury', 'AC', 'Luxury']
  },
  capacity: {
    seated: {
      type: Number,
      required: true,
      min: 0
    },
    standing: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
busSchema.index({ busNumber: 1 });
busSchema.index({ operator: 1 });
busSchema.index({ status: 1 });

module.exports = mongoose.model('Bus', busSchema);