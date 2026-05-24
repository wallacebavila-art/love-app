import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SideMenu = ({ isOpen, onClose, onOpenCalendar, onOpenWeather, onOpenAdmin, onOpenSettings, onOpenICloudCalendar }) => {
  const { user } = useAuth();
  const [useLoveName, setUseLoveName] = useState(false);

  useEffect(() => {
    // Carregar preferência do localStorage
    const saved = localStorage.getItem('useLoveName');
    if (saved) {
      setUseLoveName(JSON.parse(saved));
    }
  }, []);

  const toggleLoveName = () => {
    const newValue = !useLoveName;
    setUseLoveName(newValue);
    localStorage.setItem('useLoveName', JSON.stringify(newValue));
    // Dispara evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('loveNameToggled', { detail: newValue }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
          </button>

          <h2 className="font-headline-lg text-[24px] text-gray-800 mb-6 mt-4">Menu</h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                onOpenCalendar();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">calendar_month</span>
              <span className="font-body-md text-[16px] text-gray-700">Calendário de Mensagens</span>
            </button>
            
            <button
              onClick={() => {
                onOpenICloudCalendar();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">event</span>
              <span className="font-body-md text-[16px] text-gray-700">Nosso Calendário</span>
            </button>

            <button
              onClick={() => {
                onOpenWeather();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">cloud</span>
              <span className="font-body-md text-[16px] text-gray-700">Clima de Hoje</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">settings</span>
              <span className="font-body-md text-[16px] text-gray-700">Configurações</span>
            </button>

            {user && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span className="material-symbols-outlined text-gray-600">admin_panel_settings</span>
                <span className="font-body-md text-[16px] text-gray-700">Admin</span>
              </button>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-600">favorite</span>
                <span className="font-body-md text-[16px] text-gray-700">Modo Amor 💕</span>
              </div>
              <button
                onClick={toggleLoveName}
                className={`w-12 h-6 rounded-full transition-colors ${useLoveName ? 'bg-pink-500' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${useLoveName ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

          </div>
          
          {/* Marca d'água no menu */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 text-center">
            <p className="font-body-md text-[12px] text-gray-500 italic">
              ~para Raíssa. Com amor, Wallace. 💕
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
