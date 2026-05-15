import { populateSampleMessages } from '../services/populateMessages';
import { sendDailyMessageNotification } from '../services/notificationService';
import { useState, useEffect } from 'react';

const SideMenu = ({ isOpen, onClose, onOpenCalendar, onOpenWeather }) => {
  const [useLoveName, setUseLoveName] = useState(false);
  const [selectedFont, setSelectedFont] = useState('playfair');

  useEffect(() => {
    // Carregar preferências do localStorage
    const savedLoveName = localStorage.getItem('useLoveName');
    if (savedLoveName) {
      setUseLoveName(JSON.parse(savedLoveName));
    }

    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
      setSelectedFont(savedFont);
    }
  }, []);

  const toggleLoveName = () => {
    const newValue = !useLoveName;
    setUseLoveName(newValue);
    localStorage.setItem('useLoveName', JSON.stringify(newValue));
    // Dispara evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('loveNameToggled', { detail: newValue }));
  };

  const changeFont = (font) => {
    setSelectedFont(font);
    localStorage.setItem('selectedFont', font);
    // Dispara evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('fontChanged', { detail: font }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
              onClick={async () => {
                await populateSampleMessages();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">database</span>
              <span className="font-body-md text-[16px] text-gray-700">Popular Mensagens</span>
            </button>

            <button
              onClick={() => {
                onOpenCalendar();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">calendar_month</span>
              <span className="font-body-md text-[16px] text-gray-700">Calendário</span>
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
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">settings</span>
              <span className="font-body-md text-[16px] text-gray-700">Configurações</span>
            </button>

            <button
              onClick={() => {
                sendDailyMessageNotification(null);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">notifications</span>
              <span className="font-body-md text-[16px] text-gray-700">Testar Notificação</span>
            </button>

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

            <div className="p-3 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-gray-600">text_fields</span>
                <span className="font-body-md text-[16px] text-gray-700">Fonte</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeFont('playfair')}
                  className={`p-2 rounded-lg text-sm transition-colors ${selectedFont === 'playfair' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  style={{ fontFamily: 'Playfair Display' }}
                >
                  Playfair
                </button>
                <button
                  onClick={() => changeFont('eb-garamond')}
                  className={`p-2 rounded-lg text-sm transition-colors ${selectedFont === 'eb-garamond' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  style={{ fontFamily: 'EB Garamond' }}
                >
                  EB Garamond
                </button>
                <button
                  onClick={() => changeFont('montserrat')}
                  className={`p-2 rounded-lg text-sm transition-colors ${selectedFont === 'montserrat' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  style={{ fontFamily: 'Montserrat' }}
                >
                  Montserrat
                </button>
                <button
                  onClick={() => changeFont('poppins')}
                  className={`p-2 rounded-lg text-sm transition-colors ${selectedFont === 'poppins' ? 'bg-pink-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  style={{ fontFamily: 'Poppins' }}
                >
                  Poppins
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
