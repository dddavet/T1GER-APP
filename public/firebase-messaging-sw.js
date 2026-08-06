importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuración quemada para el SW (sin secretos críticos, Firebase client keys son públicas)
const firebaseConfig = {
  projectId: "t1ger-69d6a",
  appId: "1:263001013008:web:11d151e0e5abfeef614395",
  apiKey: "AIzaSyA5otjKee-NDSHRuQwPfgP7sDfbqOXFYFc",
  authDomain: "t1ger-69d6a.firebaseapp.com",
  storageBucket: "t1ger-69d6a.firebasestorage.app",
  messagingSenderId: "263001013008",
  measurementId: "G-ZS1V3MLQ60"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'T1GER';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes un nuevo mensaje.',
    icon: '/logo192.png', // Reemplazar con el ícono real de la PWA
    badge: '/logo192.png',
    data: payload.data,
    vibrate: [50, 50, 100]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
