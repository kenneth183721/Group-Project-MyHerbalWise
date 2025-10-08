// Simple notification debug test
// Run this in browser console to test basic notification functionality

console.log('🔔 Starting notification debug test...');

// Check browser support
console.log('Browser support:', 'Notification' in window);
console.log('Current permission:', Notification.permission);

// Function to test basic notification
async function testBasicNotification() {
    console.log('🧪 Testing basic notification...');
    
    // Request permission if needed
    if (Notification.permission === 'default') {
        console.log('📋 Requesting permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
    }
    
    // Send test notification if permission granted
    if (Notification.permission === 'granted') {
        console.log('✅ Sending test notification...');
        
        const notification = new Notification('🧪 測試通知', {
            body: '如果您看到這個通知，表示瀏覽器通知功能正常運作！',
            icon: '/logo192.png',
            tag: 'debug-test-' + Date.now(),
            requireInteraction: false,
            silent: false
        });
        
        notification.onshow = function() {
            console.log('✨ Notification is showing!');
        };
        
        notification.onclick = function() {
            console.log('👆 Notification clicked!');
            notification.close();
        };
        
        notification.onerror = function(e) {
            console.error('❌ Notification error:', e);
        };
        
        notification.onclose = function() {
            console.log('🔕 Notification closed');
        };
        
        // Auto close after 5 seconds
        setTimeout(() => {
            try {
                notification.close();
                console.log('🔕 Auto-closed notification');
            } catch (e) {
                console.log('Note: Notification already closed');
            }
        }, 5000);
        
    } else {
        console.log('❌ Permission not granted:', Notification.permission);
    }
}

// Function to check system notification settings
function checkSystemSettings() {
    console.log('💻 System notification check:');
    console.log('- User agent:', navigator.userAgent);
    console.log('- Platform:', navigator.platform);
    console.log('- Online:', navigator.onLine);
    console.log('- Focus state:', document.hasFocus());
    console.log('- Visibility state:', document.visibilityState);
    
    // Check if user has "Do Not Disturb" or "Focus" mode enabled
    if ('permissions' in navigator) {
        navigator.permissions.query({name: 'notifications'}).then(function(result) {
            console.log('- Permission state:', result.state);
        });
    }
}

// Run tests
checkSystemSettings();
console.log('🎯 To test notification, run: testBasicNotification()');

// Make function globally available
window.testBasicNotification = testBasicNotification;