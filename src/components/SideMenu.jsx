import { populateSampleMessages } from '../services/populateMessages';
import { sendDailyMessageNotification } from '../services/notificationService';

const SideMenu = ({ isOpen, onClose, onOpenCalendar, onOpenWeather }) => {

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
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
