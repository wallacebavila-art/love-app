import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { logger } from '../utils/logger';

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
    logger.error('Erro ao enviar notificação para Firestore:', error);
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
    logger.error('Erro ao ouvir notificações:', error);
  });

  return unsubscribe;
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true });
    logger.log('Notificação marcada como lida');
  } catch (error) {
    logger.error('Erro ao marcar notificação como lida:', error);
  }
};

export const clearAllNotifications = async () => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const snapshot = await getDocs(notificationsRef);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    logger.log(`✅ ${snapshot.docs.length} notificações deletadas`);
    return true;
  } catch (error) {
    logger.error('Erro ao limpar notificações:', error);
    return false;
  }
};
