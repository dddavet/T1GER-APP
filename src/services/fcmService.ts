import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { app, db } from '../firebase';

// Esta llave VAPID es necesaria para autenticar el cliente web con los servidores push de Firebase.
// Debería sacarse de las configuraciones del proyecto en Firebase Console.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'REEMPLAZAR_CON_VAPID_KEY_REAL_SI_EXISTE';

/**
 * Solicita permiso para enviar notificaciones Push y guarda el token en el perfil del usuario.
 */
export const requestPushNotificationsPermission = async (userId: string) => {
  try {
    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) {
      console.warn('Firebase Messaging no está soportado en este navegador.');
      return false;
    }
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Permiso de notificaciones concedido.');

      // Obtener el FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (currentToken) {
        console.info('FCM token obtenido; guardando registro del dispositivo.');
        
        // Guardar el token en el array de tokens del usuario
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(currentToken)
        });
        
        return true;
      } else {
        console.warn('No se pudo obtener el token FCM de registro.');
        return false;
      }
    } else {
      console.warn('Permiso de notificaciones denegado por el usuario.');
      return false;
    }
  } catch (error) {
    console.error('Error al solicitar permiso o generar token FCM:', error);
    return false;
  }
};
