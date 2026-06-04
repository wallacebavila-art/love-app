import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

/**
 * Provider genérico para gerenciar múltiplos modais
 * Substitui LoginModalContext e NotificationModalContext
 */
export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState({
    login: false,
    raissaLogin: false,
    notification: false,
    calendar: false,
    weather: false,
    admin: false,
    settings: false,
    travelMap: false,
    musicPlayer: false,
    iCloudCalendar: false,
    youtubeDownloader: false,
  });

  /**
   * Abre um modal específico
   * @param {string} modalName - Nome do modal
   */
  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  /**
   * Fecha um modal específico
   * @param {string} modalName - Nome do modal
   */
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  /**
   * Toggle um modal específico
   * @param {string} modalName - Nome do modal
   */
  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  /**
   * Fecha todos os modais
   */
  const closeAllModals = useCallback(() => {
    setModals({
      login: false,
      raissaLogin: false,
      notification: false,
      calendar: false,
      weather: false,
      admin: false,
      settings: false,
      travelMap: false,
      musicPlayer: false,
      iCloudCalendar: false,
      youtubeDownloader: false,
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{
        modals,
        openModal,
        closeModal,
        toggleModal,
        closeAllModals,
        // Compatibilidade com LoginModalContext
        isLoginModalOpen: modals.login,
        setIsLoginModalOpen: (open) => open ? openModal('login') : closeModal('login'),
        isRaissaLoginModalOpen: modals.raissaLogin,
        setIsRaissaLoginModalOpen: (open) => open ? openModal('raissaLogin') : closeModal('raissaLogin'),
        // Compatibilidade com NotificationModalContext
        isNotificationModalOpen: modals.notification,
        setIsNotificationModalOpen: (open) => open ? openModal('notification') : closeModal('notification'),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

/**
 * Hook para usar o ModalContext
 */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

/**
 * Hook específico para LoginModal (compatibilidade)
 */
export const useLoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, isRaissaLoginModalOpen, setIsRaissaLoginModalOpen } = useModal();
  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isRaissaLoginModalOpen,
    setIsRaissaLoginModalOpen,
  };
};

/**
 * Hook específico para NotificationModal (compatibilidade)
 */
export const useNotificationModal = () => {
  const { isNotificationModalOpen, setIsNotificationModalOpen } = useModal();
  return {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
  };
};
