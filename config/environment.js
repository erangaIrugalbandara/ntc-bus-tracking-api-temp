const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  development: {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ntc_bus_tracking',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    corsOrigins: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173']
  },
  production: {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    apiBaseUrl: process.env.API_BASE_URL,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];