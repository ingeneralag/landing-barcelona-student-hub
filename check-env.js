#!/usr/bin/env node

// Script للتحقق من متغيرات البيئة
console.log('🔍 Checking environment variables...\n');

// Backend variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const port = process.env.PORT || '4242';

console.log('Backend (Node.js):');
console.log('  STRIPE_SECRET_KEY:', stripeSecretKey ? `${stripeSecretKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('  PORT:', port);
console.log('');

// Frontend variables (these are build-time, so we can't check them at runtime)
console.log('Frontend (Vite):');
console.log('  VITE_STRIPE_PUBLISHABLE_KEY: Check in .env file or build config');
console.log('  VITE_BACKEND_URL: Check in .env file or build config');
console.log('');

// Validation
if (!stripeSecretKey) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is not set!');
  console.error('   Please set it in your .env file or environment variables.');
  process.exit(1);
}

if (!stripeSecretKey.startsWith('sk_test_') && !stripeSecretKey.startsWith('sk_live_')) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY does not start with sk_test_ or sk_live_');
}

console.log('✅ Environment variables check passed!');
console.log('');
console.log('Next steps:');
console.log('  1. Make sure VITE_STRIPE_PUBLISHABLE_KEY is set in your build environment');
console.log('  2. Make sure the domain is registered in Stripe Dashboard');
console.log('  3. Make sure HTTPS is enabled for Apple Pay/Google Pay');

