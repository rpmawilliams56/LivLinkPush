// service-worker.js

// Listen for push events from the server
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');

  let notificationData = {
    title: 'LiveLink',         // Default title
    message: 'You have a new notification.',
    url: '/'                   // Default URL to open on click
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('Error parsing push event data:', e);
    }
  }

  const options = {
    body: notificationData.message,
    icon: '/icons/icon-192x192.png',  // Customize with your app icon path
    badge: '/icons/badge-72x72.png',  // Optional badge icon
    data: {
      url: notificationData.url      // Pass URL to notification click event
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if URL is already open, focus it
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
