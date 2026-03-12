const path = require('path');

console.log('1. Starting import test...');

try {
  console.log('2. Importing AvailabilityService...');
  const AvailabilityService = require('./src/modules/availability/AvailabilityService');
  console.log('   ✓ AvailabilityService imported successfully');
  
  console.log('3. Importing availability routes...');
  const availabilityRoutes = require('./src/routes/availability.js');
  console.log('   ✓ availabilityRoutes imported successfully');
  
  console.log('4. All imports successful!');
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR during import:');
  console.error('   Message:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}
