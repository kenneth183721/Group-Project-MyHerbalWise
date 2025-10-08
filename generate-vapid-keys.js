// Generate VAPID keys for push notifications
const webpush = require('web-push');

console.log('🔑 Generating VAPID keys...');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated!');
console.log('');
console.log('📋 Copy these to your server configuration:');
console.log('');
console.log('PUBLIC KEY (use in frontend):');
console.log(vapidKeys.publicKey);
console.log('');
console.log('PRIVATE KEY (keep secret, use in backend):');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📝 Add these to your server.js or environment variables:');
console.log(`const VAPID_PUBLIC_KEY = '${vapidKeys.publicKey}';`);
console.log(`const VAPID_PRIVATE_KEY = '${vapidKeys.privateKey}';`);
console.log('');
console.log('⚠️  IMPORTANT: Keep the private key secret and secure!');