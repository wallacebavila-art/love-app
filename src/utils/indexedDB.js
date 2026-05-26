const DB_NAME = 'love-app-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

export const openDB = () => {
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

export const addNotification = async (notification) => {
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

export const getAllNotifications = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    transaction.oncomplete = () => db.close();
  });
};

export const clearNotifications = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    transaction.oncomplete = () => db.close();
  });
};

export const deleteOldNotifications = async (maxAge = 24 * 60 * 60 * 1000) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const notifications = request.result;
      const now = Date.now();
      const oldNotifications = notifications.filter(n => now - n.timestamp > maxAge);

      oldNotifications.forEach(notification => {
        store.delete(notification.id);
      });

      resolve(oldNotifications.length);
    };

    transaction.oncomplete = () => db.close();
  });
};
