importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBPpMEAe3yMYl8Y49btaV4lUiZLN_ZQEBo",
  authDomain: "para-raissa.firebaseapp.com",
  projectId: "para-raissa",
  storageBucket: "para-raissa.firebasestorage.app",
  messagingSenderId: "372214287601",
  appId: "1:372214287601:web:75eb749127035cb7d9ad50"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Received background message', payload);
  
  const notificationTitle = payload.notification?.title || 'Nova Mensagem';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192.svg',
    badge: payload.notification?.badge || '/icon-192.svg',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
