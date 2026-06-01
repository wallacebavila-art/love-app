import { useState, useEffect } from 'react';

/**
 * Componente de status de conexão
 * 
 * Mostra indicador visual quando o usuário está offline ou online
 */
const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null; // Não mostrar nada quando online
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
      <span className="material-symbols-outlined text-sm">wifi_off</span>
      <span className="text-sm font-medium">Você está offline</span>
    </div>
  );
};

export default ConnectionStatus;
