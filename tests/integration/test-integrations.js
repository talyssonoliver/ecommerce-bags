import dotenv from 'dotenv';
import { testStripeConnection, testStripeProductCreation } from './lib/stripe/client.test.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runTests() {
  console.log('🧪 Running integration tests...\n');
  
  // Test Stripe
  console.log('--- Stripe Integration Tests ---');
  const stripeConnectionResult = await testStripeConnection();
  console.log('Connection test:', stripeConnectionResult.success ? '✅ PASSED' : '❌ FAILED');
  
  const stripeProductResult = await testStripeProductCreation();
  console.log('Product creation test:', stripeProductResult.success ? '✅ PASSED' : '❌ FAILED');
  console.log('\n');
  
  // Test Cloudinary
  // console.log('--- Cloudinary Integration Tests ---');
  // const cloudinaryConnectionResult = await testCloudinaryConnection();
  // console.log('Connection test:', cloudinaryConnectionResult.success ? '✅ PASSED' : '❌ FAILED');
  
  // const cloudinaryUploadResult = await testCloudinaryUpload();
  // console.log('Upload test:', cloudinaryUploadResult.success ? '✅ PASSED' : '❌ FAILED');
  // console.log('\n');
  
  // Overall status
  const allPassed = 
    stripeConnectionResult.success && 
    stripeProductResult.success && 
    cloudinaryConnectionResult.success && 
    cloudinaryUploadResult.success;
    
  console.log('--- Test Summary ---');
  console.log(`Overall status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});