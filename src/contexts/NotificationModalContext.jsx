import { createContext, useContext, useState } from 'react';

const NotificationModalContext = createContext();

export const useNotificationModal = () => {
  const context = useContext(NotificationModalContext);
  if (!context) {
    throw new Error('useNotificationModal must be used within a NotificationModalProvider');
  }
  return context;
};

export const NotificationModalProvider = ({ children }) => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  return (
    <NotificationModalContext.Provider value={{ isNotificationModalOpen, setIsNotificationModalOpen }}>
      {children}
    </NotificationModalContext.Provider>
  );
};
