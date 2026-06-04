import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoginModal } from '../contexts/LoginModalContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { setIsLoginModalOpen } = useLoginModal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    setIsLoginModalOpen(true);
    return null;
  }

  if (user.userType !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default React.memo(ProtectedRoute);
