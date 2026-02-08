
// Listen for push events
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/icon-192.png',
            badge: data.badge || '/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.data?.url || '/',
                ...data.data, // include all data properties
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Details',
                },
            ],
        };
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

// Listen for notification click events
self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');
    event.notification.close();

    // Get the URL to open
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients
            .matchAll({
                type: 'window',
                includeUncontrolled: true,
            })
            .then(function (clientList) {
                // If a window is already open, focus it
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
