const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Login admin
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide username and password'
      });
    }

    // Check if admin exists (need to explicitly select password)
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (admin.status === 'inactive') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is inactive'
      });
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};