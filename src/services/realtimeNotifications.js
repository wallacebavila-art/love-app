import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const sendRealtimeNotification = async (title, body) => {
  try {
    console.log('sendRealtimeNotification: Iniciando...');
    console.log('sendRealtimeNotification: title:', title);
    console.log('sendRealtimeNotification: body:', body);
    
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    console.log('sendRealtimeNotification: notificationsRef criado');
    
    const notificationData = {
      title,
      body,
      timestamp: Date.now(),
      read: false
    };
    console.log('sendRealtimeNotification: notificationData:', notificationData);
    
    await addDoc(notificationsRef, notificationData);
    console.log('sendRealtimeNotification: addDoc() concluído');
    
    console.log('Notificação enviada para Firestore');
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação para Firestore:', error);
    console.error('Erro detalhes:', error.message);
    console.error('Erro stack:', error.stack);
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
      timestamp: new Date(doc.data().timestamp)
    }));
    
    console.log('Notificações recebidas do Firestore:', notifications);
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
