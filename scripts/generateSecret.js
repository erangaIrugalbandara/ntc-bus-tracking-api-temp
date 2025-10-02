// Generate a strong JWT secret for production
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n========================================');
console.log('Generated JWT Secret for Production:');
console.log('========================================');
console.log(secret);
console.log('========================================');
console.log('\nAdd this to your .env.production file:');
console.log(`JWT_SECRET=${secret}`);
console.log('========================================\n');