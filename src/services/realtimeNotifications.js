import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const sendRealtimeNotification = async (title, body, sender = 'admin', audioUrl = null) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const notificationData = {
      title,
      body,
      timestamp: Date.now(),
      read: false,
      sender,
      audioUrl
    };

    await addDoc(notificationsRef, notificationData);
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação para Firestore:', error);
    return false;
  }
};

export const listenToNotifications = (callback) => {
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(50));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      body: doc.data().body,
      timestamp: new Date(doc.data().timestamp),
      sender: doc.data().sender || 'admin',
      audioUrl: doc.data().audioUrl || null
    }));

    callback(notifications);
  }, (error) => {
    console.error('Erro ao ouvir notificações:', error);
  });

  return unsubscribe;
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true });
    console.log('Notificação marcada como lida');
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};
