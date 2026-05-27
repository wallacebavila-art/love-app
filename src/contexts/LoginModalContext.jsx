import { createContext, useContext, useState } from 'react';

const LoginModalContext = createContext();

export const LoginModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRaissaLoginModalOpen, setIsRaissaLoginModalOpen] = useState(false);

  return (
    <LoginModalContext.Provider
      value={{
        isLoginModalOpen,
        setIsLoginModalOpen,
        isRaissaLoginModalOpen,
        setIsRaissaLoginModalOpen,
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};
