// Stripe configuration utility
export const getStripeConfig = () => {
  // Check both client-side and server-side environment variables
  const publishableKey = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  console.log('🔍 Checking Stripe configuration...');
  console.log('Environment:', typeof window !== 'undefined' ? 'client' : 'server');
  console.log('Publishable key exists:', !!publishableKey);
  console.log('Publishable key value:', publishableKey ? publishableKey.substring(0, 20) + '...' : 'undefined');
  
  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    return null;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ Invalid Stripe publishable key format. Should start with "pk_"');
    console.error('Key format:', publishableKey.substring(0, 10));
    return null;
  }
  
  console.log('✅ Stripe publishable key found:', publishableKey.substring(0, 20) + '...');
  
  return {
    publishableKey,
    options: {
      locale: 'en' as const, // Force English locale to avoid localization issues
      apiVersion: '2023-10-16', // Use stable API version
    }
  };
};

// Check if Stripe is properly configured
export const isStripeConfigured = () => {
  return getStripeConfig() !== null;
};