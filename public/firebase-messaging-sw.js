importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: "para-raissa.firebaseapp.com",
  projectId: "para-raissa",
  storageBucket: "para-raissa.firebasestorage.app",
  messagingSenderId: "372214287601",
  appId: "1:372214287601:web:75eb749127035cb7d9ad50",
  databaseURL: "https://para-raissa-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// IndexedDB helper functions
const DB_NAME = 'love-app-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const addNotification = async (notification) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(notification);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    transaction.oncomplete = () => db.close();
  });
};

// Background message handler
messaging.onBackgroundMessage(async (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  console.log('[firebase-messaging-sw.js] Payload notification:', payload.notification);
  console.log('[firebase-messaging-sw.js] Payload data:', payload.data);

  const notification = {
    id: Date.now().toString(),
    title: payload.notification?.title || 'Nova Mensagem',
    body: payload.notification?.body || '',
    timestamp: Date.now()
  };

  console.log('[firebase-messaging-sw.js] Notification object to store:', notification);

  // Store notification in IndexedDB
  try {
    await addNotification(notification);
    console.log('[firebase-messaging-sw.js] Notification stored in IndexedDB successfully');
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error storing notification:', error);
    console.error('[firebase-messaging-sw.js] Error details:', error.message);
  }

  const notificationTitle = payload.notification?.title || 'Nova Mensagem';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: payload.data,
  };

  console.log('[firebase-messaging-sw.js] Showing native notification');
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' || client.url === '/love-app/') {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
