import { stripe } from './client';

export async function testStripeConnection() {
  try {
    // Attempt to retrieve balance to test connection
    const balance = await stripe.balance.retrieve();
    console.log('Stripe connection successful!');
    console.log('Available balance:', balance.available.map(b => `${b.amount / 100} ${b.currency.toUpperCase()}`).join(', '));
    return { success: true, balance };
  } catch (error) {
    console.error('Stripe connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function testStripeProductCreation() {
  try {
    // Create a test product
    const product = await stripe.products.create({
      name: 'Test Product',
      description: 'A test product for integration testing',
      active: false,
      metadata: {
        test: 'true',
        integration: 'test'
      }
    });
    
    console.log('Test product created successfully:', product.id);
    
    // Clean up - delete the test product
    await stripe.products.update(product.id, { active: false });
    
    return { success: true, productId: product.id };
  } catch (error) {
    console.error('Test product creation failed:', error.message);
    return { success: false, error: error.message };
  }
}